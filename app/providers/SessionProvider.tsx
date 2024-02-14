import React, { createContext, ReactNode, useContext, useState } from "react";


type User = {
  name: string;
  email: string;
  id: string;
  session: string;
  image: string;
} | null;


type SessionContextType = {
  session: {
    user: User;

  };
  setSession: (session: { user: User }) => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<{
    user: SessionContextType["session"]["user"];
  }>({ user: null });

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};