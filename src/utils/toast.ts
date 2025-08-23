// src/utils/toast.ts

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// Toast container ID
const TOAST_CONTAINER_ID = 'toast-container';

// Create toast container if it doesn't exist
const createToastContainer = (): HTMLElement => {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
  
  return container;
};

// Create toast element
const createToastElement = (message: string, type: ToastType): HTMLElement => {
  const toast = document.createElement('div');
  
  // Base classes
  const baseClasses = 'px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium pointer-events-auto transform transition-all duration-300 ease-in-out translate-x-full opacity-0';
  
  // Type-specific classes
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200'
  };
  
  // Icons
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.className = `${baseClasses} ${typeClasses[type]}`;
  toast.innerHTML = `
    <span class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full font-bold text-xs">
      ${icons[type]}
    </span>
    <span class="flex-1">${message}</span>
    <button class="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.remove()">
      ✕
    </button>
  `;
  
  return toast;
};

// Remove toast with animation
const removeToast = (toast: HTMLElement): void => {
  toast.style.transform = 'translateX(100%)';
  toast.style.opacity = '0';
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
};

// Main toast function
export const showToast = (
  message: string, 
  type: ToastType = 'info', 
  options: ToastOptions = {}
): void => {
  const { duration = 4000 } = options;
  
  const container = createToastContainer();
  const toast = createToastElement(message, type);
  
  // Add toast to container
  container.appendChild(toast);
  
  // Trigger animation after a brief delay
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Auto-remove toast after duration
  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) {
        removeToast(toast);
      }
    }, duration);
  }
  
  // Add click to dismiss
  toast.addEventListener('click', () => {
    removeToast(toast);
  });
};

// Utility functions for specific toast types
export const toast = {
  success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => showToast(message, 'info', options),
};

export default toast;