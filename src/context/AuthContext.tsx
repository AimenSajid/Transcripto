import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchCurrentUser, signOut as signOutRequest } from "../api/auth";
import type { User } from "../../shared/types";

type AuthStatus = "loading" | "signed-in" | "signed-out";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  setUser: (user: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((fetchedUser) => {
        setUserState(fetchedUser);
        setStatus(fetchedUser ? "signed-in" : "signed-out");
      })
      .catch(() => setStatus("signed-out"));
  }, []);

  function setUser(nextUser: User) {
    setUserState(nextUser);
    setStatus("signed-in");
  }

  async function signOut() {
    await signOutRequest();
    setUserState(null);
    setStatus("signed-out");
  }

  return (
    <AuthContext.Provider value={{ status, user, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
