import { Link } from "react-router-dom";
import underReviewLogo from "@/assets/under-review-logo.png.asset.json";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-background flex items-center justify-center">
                <img src={underReviewLogo.url} alt="Under Review" className="w-14 h-14 object-contain" />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering fans with transparent, evidence-based sports officiating analysis.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Browse Plays</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Rulebook Library</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Leaderboard</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Submit a Play</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Leagues</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">NFL</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">NBA</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">MLB</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">NHL</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Under Review. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Not affiliated with NFL, NBA, MLB, or NHL.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
