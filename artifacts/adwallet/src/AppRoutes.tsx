import { Switch, Route } from "wouter";
import { LandingLayout } from "./components/landing-layout";
import { DashboardLayout } from "./components/dashboard-layout";
import { AuthProvider, useAuth } from "./components/auth-context";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import WalletPage from "./pages/wallet";

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Login />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <LandingLayout><Landing /></LandingLayout>
      </Route>
      <Route path="/login">
        <LandingLayout><Login /></LandingLayout>
      </Route>
      <Route path="/register">
        <LandingLayout><Register /></LandingLayout>
      </Route>
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/wallet"><ProtectedRoute component={WalletPage} /></Route>
      {/* Add more routes later */}
      <Route component={() => <div>Not Found</div>} />
    </Switch>
  );
}

// Ensure App renders properly
export default function App() {
  return (
    // QueryClientProvider etc should wrap AuthProvider (already handled in earlier App.tsx, but I'll write full to be safe)
    <div>Error: Replaced by App.tsx main definition.</div>
  );
}
