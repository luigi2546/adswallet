import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./components/auth-context";
import { CurrencyProvider } from "./components/currency-context";
import { LandingLayout } from "./components/landing-layout";
import { DashboardLayout } from "./components/dashboard-layout";

import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import WalletPage from "./pages/wallet";
import CardsPage from "./pages/cards";
import CampaignsPage from "./pages/campaigns/index";
import NewCampaignPage from "./pages/campaigns/new";
import CampaignDetail from "./pages/campaigns/detail";
import AnalyticsPage from "./pages/analytics";
import SocialInsightsPage from "./pages/social-insights";
import SettingsPage from "./pages/settings";
import BoostPage from "./pages/boost";
import FeaturesPage from "./pages/features";
import HowItWorksPage from "./pages/how-it-works";
import PricingPage from "./pages/pricing";
import ContactPage from "./pages/contact";
import PrivacyPage from "./pages/privacy";
import TermsPage from "./pages/terms";
import KYCPage from "./pages/kyc";
import HelpPage from "./pages/help";
import SuccessStoriesPage from "./pages/success-stories";

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

      {/* Public content pages */}
      <Route path="/features">
        <LandingLayout><FeaturesPage /></LandingLayout>
      </Route>
      <Route path="/how-it-works">
        <LandingLayout><HowItWorksPage /></LandingLayout>
      </Route>
      <Route path="/pricing">
        <LandingLayout><PricingPage /></LandingLayout>
      </Route>
      <Route path="/contact">
        <LandingLayout><ContactPage /></LandingLayout>
      </Route>
      <Route path="/privacy">
        <LandingLayout><PrivacyPage /></LandingLayout>
      </Route>
      <Route path="/terms">
        <LandingLayout><TermsPage /></LandingLayout>
      </Route>
      <Route path="/kyc">
        <LandingLayout><KYCPage /></LandingLayout>
      </Route>
      <Route path="/help">
        <LandingLayout><HelpPage /></LandingLayout>
      </Route>
      <Route path="/success-stories">
        <LandingLayout><SuccessStoriesPage /></LandingLayout>
      </Route>

      {/* Protected app routes */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/wallet"><ProtectedRoute component={WalletPage} /></Route>
      <Route path="/cards"><ProtectedRoute component={CardsPage} /></Route>
      <Route path="/campaigns"><ProtectedRoute component={CampaignsPage} /></Route>
      <Route path="/campaigns/new"><ProtectedRoute component={NewCampaignPage} /></Route>
      <Route path="/campaigns/:id"><ProtectedRoute component={CampaignDetail} /></Route>
      <Route path="/boost"><ProtectedRoute component={BoostPage} /></Route>
      <Route path="/analytics"><ProtectedRoute component={AnalyticsPage} /></Route>
      <Route path="/social-insights"><ProtectedRoute component={SocialInsightsPage} /></Route>
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
            <CurrencyProvider>
              <Router />
            </CurrencyProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
