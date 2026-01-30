import { User } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: {
    message: string;
  };
}

export async function login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (data.success && data.data) {
      const { token, user } = data.data;

      // Check if user is a SALESMAN or ADMIN
      if (user.role !== 'SALESMAN' && user.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Access denied. You do not have permission to access this application.',
        };
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Login failed. Please check your credentials.',
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Failed to connect to the server. Please try again.',
    };
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      return null;
    }

    const user: User = JSON.parse(userStr);

    // Verify user is a SALESMAN or ADMIN
    if (user.role !== 'SALESMAN' && user.role !== 'ADMIN') {
      logout();
      return null;
    }

    // Optional: Verify token with backend
    // You can add a token verification endpoint call here

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    logout();
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}