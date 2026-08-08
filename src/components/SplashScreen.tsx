import { useState, useEffect } from "react";
import underReviewLogo from "@/assets/under-review-logo.png.asset.json";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 500);
    const done = setTimeout(onComplete, 850);
    return () => { clearTimeout(timer); clearTimeout(done); };
  }, [onComplete]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={underReviewLogo.url}
        alt="Under Review"
        className="w-56 h-56 object-contain animate-fade-in"
      />
    </div>
  );
};

export default SplashScreen;
