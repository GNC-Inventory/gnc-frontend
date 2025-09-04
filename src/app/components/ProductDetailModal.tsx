'use client';

import { useState } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from '@/utils/toast';

// Updated interface - removed unitCost completely
interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  sku: string;
  basePrice: number;
  stockLeft: number;
  dateAdded: string;
  types?: string[];
  brands?: string[];
  sizes?: string[];
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, price: number, quantity: number) => void;
  onInventoryUpdate?: (productId: string, newStockLeft: number) => void;
}

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart,
  onInventoryUpdate
}: ProductDetailModalProps) {
  const [price, setPrice] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-numeric characters except decimal point
    const numericValue = input.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    const decimalCount = numericValue.split('.').length - 1;
    if (decimalCount > 1) return;
    
    setPrice(numericValue);
    
    // Format for display if there's a valid number
    if (numericValue && !isNaN(parseFloat(numericValue))) {
      const number = parseFloat(numericValue);
      setDisplayPrice(`₦ ${formatCurrency(number)}`);
    } else {
      setDisplayPrice('₦ ');
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= (product?.stockLeft || 1)) {
      setQuantity(value);
    }
  };

  const deductInventory = async (productId: string, quantityToDeduct: number) => {
    try {
      const response = await fetch('/.netlify/functions/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          action: 'deduct',
          quantity: quantityToDeduct
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update inventory');
      }

      return result.data; // Returns updated inventory item
    } catch (error) {
      console.error('Error deducting inventory:', error);
      throw error;
    }
  };

  const handleAddItem = async () => {
    if (!product || !price || !onAddToCart) return;
    
    // Validate quantity against current stock
    if (quantity > product.stockLeft) {
      toast.error(`Only ${product.stockLeft} items available in stock`);
      return;
    }

    setIsProcessing(true);
    
    // Show processing toast (your toast system doesn't have loading, so we'll use info)
    toast.info(`Adding ${quantity} item(s) to cart...`);

    try {
      // Step 1: Deduct inventory first
      const updatedInventoryItem = await deductInventory(product.id, quantity);
      
      // Step 2: Update local product state
      const updatedProduct = {
        ...product,
        stockLeft: updatedInventoryItem.stockLeft
      };

      // Step 3: Update parent component's inventory state
      if (onInventoryUpdate) {
        onInventoryUpdate(product.id, updatedInventoryItem.stockLeft);
      }

      // Step 4: Add to cart only after successful inventory deduction
      onAddToCart(updatedProduct, parseFloat(price), quantity);

      // Step 5: Show success and reset form
      toast.success(`${product.name} (${quantity}) added to cart`);
      
      setPrice('');
      setDisplayPrice('');
      setQuantity(1);

    } catch (error: any) {
      // Handle specific error cases
      if (error.message.includes('insufficient stock')) {
        const match = error.message.match(/only (\d+) available/i);
        const availableStock = match ? match[1] : 'limited';
        toast.error(`Insufficient stock! Only ${availableStock} items available. Another rep may be processing this item.`);
      } else if (error.message.includes('not found')) {
        toast.error('Product not found in inventory');
      } else {
        toast.error(`Failed to add item: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isAddButtonActive = price.trim() !== '' && product && product.stockLeft > 0 && quantity > 0 && quantity <= product.stockLeft && !isProcessing;

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Custom overlay with blur */}
      <div 
        className="fixed z-40 bg-black bg-opacity-60 backdrop-blur-sm"
        style={{
          top: 0,
          left: '256px',
          right: 0,
          bottom: 0,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="fixed bg-white z-50 rounded-t-[32px]"
        style={{
          width: '1104px',
          top: '140px',
          bottom: '0px',
          left: '50%',
          marginLeft: '128px',
          transform: 'translateX(-50%)',
          padding: '24px 32px',
          gap: '24px',
        }}
      >
        {/* Header with Close Button and Stock Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-black mb-2">
              {product.name}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">SKU: {product.sku}</span>
              <span className="text-gray-600">Category: {product.category}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                product.stockLeft === 0 ? 'bg-red-100 text-red-700' :
                product.stockLeft <= 5 ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {product.stockLeft === 0 ? 'Out of Stock' : 
                 product.stockLeft <= 5 ? `Low Stock (${product.stockLeft})` :
                 `${product.stockLeft} in stock`}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Left Side - Product Image and Details */}
          <div className="flex-1">
            <div className="mb-8 bg-gray-50 rounded-lg p-8 flex items-center justify-center h-80">
              <Image
                src={product.image}
                alt={product.name}
                width={250}
                height={250}
                className="object-contain max-h-full"
              />
            </div>

            {/* Product Specifications */}
            <div className="space-y-6">
              {/* Type */}
              <div>
                <h3 className="mb-3 text-base font-semibold text-black">Type</h3>
                <div className="flex flex-wrap gap-2">
                  {product.types && product.types.length > 0 ? (
                    product.types.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No types available</span>
                  )}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h3 className="mb-3 text-base font-semibold text-black">Brand</h3>
                <div className="flex flex-wrap gap-2">
                  {product.brands && product.brands.length > 0 ? (
                    product.brands.map((brand, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {brand}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No brands available</span>
                  )}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="mb-3 text-base font-semibold text-black">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map((size, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {size}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No sizes available</span>
                  )}
                </div>
              </div>

              {/* Product Info - Only Base Price and Date Added */}
              <div>
                <h3 className="mb-3 text-base font-semibold text-black">Product Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Base Price:</span> ₦{formatCurrency(product.basePrice)}</p>
                  <p><span className="font-medium">Date Added:</span> {product.dateAdded}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Price Input, Quantity Input and Add Button */}
          <div className="w-80">
            <div className="mb-6">
              <label htmlFor="price" className="block mb-3 text-sm font-medium text-black">
                Enter price
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  id="price"
                  value={displayPrice || '₦ '}
                  onChange={handlePriceChange}
                  placeholder={`₦${formatCurrency(product.basePrice)}`}
                  disabled={product.stockLeft === 0 || isProcessing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {/* Hidden input to store the raw numeric value */}
                <input
                  type="hidden"
                  value={price}
                />
              </div>
            </div>

            {/* Product Quantity Input */}
            <div className="mb-6">
              <label htmlFor="quantity" className="block mb-3 text-sm font-medium text-black">
                Product Quantity
              </label>
              
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.stockLeft}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={product.stockLeft === 0 || isProcessing}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-center"
              />
              
              {product.stockLeft === 0 && (
                <p className="mt-2 text-sm text-red-600">This item is out of stock and cannot be added to cart.</p>
              )}
              {quantity > product.stockLeft && (
                <p className="mt-2 text-sm text-red-600">Quantity exceeds available stock ({product.stockLeft} available).</p>
              )}
            </div>

            {/* Add Item Button */}
            <button
              onClick={handleAddItem}
              disabled={!isAddButtonActive}
              className={`flex items-center justify-center w-40 h-10 rounded-lg transition-all gap-1 px-4 ${
                isAddButtonActive
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-white ml-1">Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className={`w-4 h-4 ${isAddButtonActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isAddButtonActive ? 'text-white' : 'text-gray-500'}`}>
                    Add item
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}