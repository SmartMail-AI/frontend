import { createContext, type ReactNode, useState } from 'react';
import { isTokenStored } from '@/utils/storage';

interface LoginContextProps {
  children?: ReactNode;
}

interface LoginContextValue {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const LoginContext = createContext<LoginContextValue>({
  isLoggedIn: false,
  setIsLoggedIn: () => {}
});

export default LoginContext;

export function LoginContextProvider({ children }: LoginContextProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(isTokenStored());
  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </LoginContext.Provider>
  );
}
