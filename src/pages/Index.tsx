import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";

import LeaderboardPreview from "@/components/home/LeaderboardPreview";
import SubmitCTA from "@/components/home/SubmitCTA";
import FeedSection from "@/components/home/FeedSection";
import { useIsMobile } from "@/hooks/use-mobile";

import SplashScreen from "@/components/SplashScreen";
import Seo from "@/components/seo/Seo";

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
      <Seo title="Under Review — Vote on Sports' Most Debated Calls" description="Settle blown calls and hot takes. Watch the play, check the official rule, and vote on NFL, NBA, MLB, and NHL's most controversial moments." path="/" jsonLd={[{ "@context": "https://schema.org", "@type": "WebSite", name: "Under Review", url: "https://undereview.com", description: "Fans review sports plays like officials: watch the clip, check the rule, and vote on the call." }, { "@context": "https://schema.org", "@type": "Organization", name: "Under Review", url: "https://undereview.com", logo: "https://undereview.com/favicon.png" }]} />
      {/* Splash is desktop-only: mobile visitors land straight in the debate feed */}
      {!isMobile && showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Header />
      <main className="pt-[40px] md:pt-[72px]">
        <HeroSection />
        <FeedSection />
        <LeaderboardPreview />
        <SubmitCTA />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
