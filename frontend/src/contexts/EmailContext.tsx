import type { Email } from '../types';
import { createContext, type ReactNode, useState } from 'react';

interface ApplicationContextValue {
  emails: Email[];
  setEmails: (emails: Email[]) => void;
}

const EmailContext = createContext<ApplicationContextValue>({
  emails: [],
  setEmails: () => {},
});

export default EmailContext;

export function ApplicationContextProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([]);

  return (
    <EmailContext.Provider value={{
      emails,
      setEmails,
    }}>
      {children}
    </EmailContext.Provider>
  )
}
