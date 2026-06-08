import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./components/auth-context";
import { LandingLayout } from "./components/landing-layout";
import { DashboardLayout } from "./components/dashboard-layout";

import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import WalletPage from "./pages/wallet";
import CampaignsPage from "./pages/campaigns/index";
import NewCampaignPage from "./pages/campaigns/new";
import CampaignDetail from "./pages/campaigns/detail";
import AnalyticsPage from "./pages/analytics";
import SettingsPage from "./pages/settings";

const queryClient = new QueryClient();

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
      <Route path="/campaigns"><ProtectedRoute component={CampaignsPage} /></Route>
      <Route path="/campaigns/new"><ProtectedRoute component={NewCampaignPage} /></Route>
      <Route path="/campaigns/:id"><ProtectedRoute component={CampaignDetail} /></Route>
      <Route path="/analytics"><ProtectedRoute component={AnalyticsPage} /></Route>
      <Route path="/settings"><ProtectedRoute component={SettingsPage} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;