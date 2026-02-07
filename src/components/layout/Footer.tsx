import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Call<span className="text-primary">Review</span>
              </span>
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
            © 2025 CallReview. All rights reserved.
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
