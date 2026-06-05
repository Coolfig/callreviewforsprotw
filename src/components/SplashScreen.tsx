import { useState, useEffect } from "react";
import underTheHoodLogo from "@/assets/under-the-hood-logo.png.asset.json";

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
        src={underTheHoodLogo.url}
        alt="Under The Hood"
        className="w-48 h-48 object-contain animate-fade-in"
      />
    </div>
  );
};

export default SplashScreen;
