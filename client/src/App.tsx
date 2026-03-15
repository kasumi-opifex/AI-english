import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FirebaseProvider } from "@/contexts/FirebaseContext";
import { AppProvider } from "@/contexts/AppContext";
import Home from "@/pages/Home";
import StepPage from "@/pages/StepPage";
import VocabPage from "@/pages/VocabPage";
import SettingsPage from "@/pages/SettingsPage";

function Routes() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/step/:id"} component={StepPage} />
      <Route path={"/vocab"} component={VocabPage} />
      <Route path={"/settings"} component={SettingsPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <FirebaseProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              {/* GitHub Pages用: ハッシュルーティングを使用 */}
              <WouterRouter hook={useHashLocation}>
                <Routes />
              </WouterRouter>
            </TooltipProvider>
          </AppProvider>
        </FirebaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
