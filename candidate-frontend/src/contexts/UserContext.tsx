import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  user_id: string;
  display_name: string;
  email: string;
}

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/debug/api/users/all');
      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
        
        // Set default user (JPS-QN2NWT if available, otherwise first user)
        const defaultUser = users.find((u: User) => u.user_id === 'JPS-QN2NWT') || users[0];
        if (defaultUser) {
          setCurrentUser(defaultUser);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser: handleSetCurrentUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Helper function for backward compatibility
export const getCurrentUserId = (): string => {
  // This will be overridden by the context
  return 'JPS-QN2NWT';
};