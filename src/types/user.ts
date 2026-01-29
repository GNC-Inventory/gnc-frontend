export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SALESMAN';
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}