
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  addUser: (username: string, password: string, role: 'cashier' | 'admin') => void;
  deleteUser: (id: string) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Hardcoded Root User ---
const rootUser: User = {
  id: 'root-user',
  username: 'root',
  password: 'Faith123$$', // In a real app, this would be a hashed password
  role: 'admin',
};

const USERS_STORAGE_KEY = 'cheeziousUsers';
const SESSION_STORAGE_KEY = 'cheeziousSession';

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([rootUser]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load users from localStorage on initial render
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        // Ensure root user is always present
        if (!parsedUsers.some((u: User) => u.id === rootUser.id)) {
            setUsers([rootUser, ...parsedUsers]);
        } else {
            setUsers(parsedUsers);
        }
      }

      const sessionUser = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if(sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist users to localStorage whenever they change
  useEffect(() => {
    try {
        // Don't store passwords in local storage for security, except for the initial setup.
        // In a real app, passwords would be hashed and stored securely in a database.
        const usersToStore = users.map(({password, ...user}) => user);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersToStore));
    } catch (error) {
      console.error("Could not save users to local storage", error);
    }
  }, [users]);
  
  // Persist current user to sessionStorage
  useEffect(() => {
      try {
          if (user) {
              sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
          } else {
              sessionStorage.removeItem(SESSION_STORAGE_KEY);
          }
      } catch (error) {
          console.error("Could not save session to session storage", error);
      }
  }, [user]);

  const login = useCallback(async (username: string, password: string): Promise<User | null> => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return foundUser;
    }
    throw new Error('Invalid username or password');
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    router.push('/login');
  }, [router]);

  const addUser = useCallback((username: string, password: string, role: 'cashier' | 'admin') => {
    if (users.some(u => u.username === username)) {
      alert('Username already exists.');
      return;
    }
    const newUser: User = { id: crypto.randomUUID(), username, password, role };
    setUsers(prev => [...prev, newUser]);
  }, [users]);

  const deleteUser = useCallback((id: string) => {
    if (id === rootUser.id) {
        alert("Cannot delete the root user.");
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const value = { user, users, isLoading, login, logout, addUser, deleteUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
