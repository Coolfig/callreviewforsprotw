import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TopThisWeek from "@/components/home/TopThisWeek";
import LeaderboardPreview from "@/components/home/LeaderboardPreview";
import SubmitCTA from "@/components/home/SubmitCTA";
import FeedSection from "@/components/home/FeedSection";
import { useIsMobile } from "@/hooks/use-mobile";

import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("ur_splash_seen") !== "1";
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("ur_splash_seen", "1");
    setShowSplash(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Splash is desktop-only: mobile visitors land straight in the debate feed */}
      {!isMobile && showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Header />
      <main className="pt-[40px] md:pt-[72px]">
        {isMobile ? (
          <>
            <HeroSection />
            <FeedSection />
            <TopThisWeek />
            <LeaderboardPreview />
            <SubmitCTA />
          </>
        ) : (
          <>
            <HeroSection />
            <TopThisWeek />
            <FeedSection />
            <LeaderboardPreview />
            <SubmitCTA />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
