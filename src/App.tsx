import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import LiveScoresTicker from "@/components/scores/LiveScoresTicker";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Rulebook from "./pages/Rulebook";
import RulebookHub from "./pages/RulebookHub";
import RulebookLeague from "./pages/RulebookLeague";
import RulebookYear from "./pages/RulebookYear";
import RulesHub from "./pages/RulesHub";
import RulesLeague from "./pages/RulesLeague";
import RulesYear from "./pages/RulesYear";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Admin from "./pages/Admin";
import AdminClipper from "./pages/AdminClipper";
import Clips from "./pages/Clips";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import SearchPage from "./pages/SearchPage";
import Bookmarks from "./pages/Bookmarks";
import Standings from "./pages/Standings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LiveScoresTicker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/rulebook" element={<Rulebook />} />
            <Route path="/rulebooks" element={<RulebookHub />} />
            <Route path="/rulebooks/:league" element={<RulebookLeague />} />
            <Route path="/rulebooks/:league/:year" element={<RulebookYear />} />
            <Route path="/rules" element={<RulesHub />} />
            <Route path="/rules/:league" element={<RulesLeague />} />
            <Route path="/rules/:league/:year" element={<RulesYear />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/clipper" element={<AdminClipper />} />
            <Route path="/clips" element={<Clips />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
