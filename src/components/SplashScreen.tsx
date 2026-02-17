import { useState, useEffect } from "react";
import refereeLogo from "@/assets/referee-logo.png";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1500);
    const done = setTimeout(onComplete, 2000);
    return () => { clearTimeout(timer); clearTimeout(done); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={refereeLogo}
        alt="CallReview"
        className="w-24 h-24 object-contain animate-fade-in"
      />
    </div>
  );
};

export default SplashScreen;
