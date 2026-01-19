import api from '@/lib/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  admins: number;
  verified: number;
  pending: number;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async getStats(): Promise<UserStats> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  async getOne(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async toggleVerification(id: string): Promise<User> {
    const response = await api.patch(`/users/${id}/toggle-verification`);
    return response.data;
  },
};
