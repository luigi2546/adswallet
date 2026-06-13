import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  useGetMe,
  getGetMeQueryKey,
  setAuthTokenGetter,
  type User,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getAccessToken, supabase } from "@/lib/supabase";

setAuthTokenGetter(getAccessToken);

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setToken(null);
    queryClient.clear();
    setLocation("/login");
  }, [queryClient, setLocation]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setToken(session?.access_token ?? null);
      setSessionReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setToken(session?.access_token ?? null);

      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const {
    data: user,
    isLoading: isLoadingMe,
    isError,
  } = useGetMe({
    query: {
      enabled: sessionReady && !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  useEffect(() => {
    if (isError && token) {
      logout();
    }
  }, [isError, token, logout]);

  const isLoading = !sessionReady || (token ? isLoadingMe : false);

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, token, isLoading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
