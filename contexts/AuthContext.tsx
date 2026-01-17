
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../core/types';
import { mockProvider } from '../core/provider';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      mockProvider.seedData(); // Khởi tạo dữ liệu trước
      
      const userList = await mockProvider.getList<User>('users');
      setUsers(userList);

      const storedUserId = localStorage.getItem('currentUserId');
      if (storedUserId) {
        const storedUser = userList.find(u => u.id === storedUserId);
        if (storedUser) {
            setUser(storedUser);
        }
      }
      setIsLoading(false); // Đánh dấu đã tải xong
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const userToLogin = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (userToLogin && userToLogin.password === password) {
      setUser(userToLogin);
      localStorage.setItem('currentUserId', userToLogin.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
