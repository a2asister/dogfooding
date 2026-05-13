import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '../graphql/queries';
import { CREATE_USER } from '../graphql/mutations';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { data, loading } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER);

  useEffect(() => {
    if (data?.users?.length > 0) {
      setUser(data.users[0]);
    } else if (!loading && data) {
        // 如果没有用户，创建一个默认用户
        createDefaultUser();
      }
    }, [data, loading]);

    const createDefaultUser = async () => {
      try {
        const { data } = await createUser({
          variables: {
            input: {
              name: '默认用户',
              email: 'demo@example.com',
            },
          },
        });
        if (data?.createUser) {
          setUser(data.createUser);
        }
      } catch (error) {
        console.error('创建用户失败:', error);
      }
    };

    return (
      <UserContext.Provider value={{ user, setUser, loading }}>
        {children}
      </UserContext.Provider>
    );
  }

  export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
      throw new Error('useUser must be used within a UserProvider');
    }
    return context;
  }
