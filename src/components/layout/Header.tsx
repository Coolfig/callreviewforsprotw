import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import refereeLogo from "@/assets/referee-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, username, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Feed", href: "/feed" },
    { name: "Community", href: "/community" },
    { name: "Rulebook", href: "/rulebook" },
    { name: "Archive", href: "/rulebooks" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "About", href: "/about" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => {
              if (location.pathname === "/" || location.pathname === "/feed") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                window.location.reload();
              } else {
                navigate("/");
              }
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <img src={refereeLogo} alt="CallReview" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Call<span className="text-primary">Review</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors ${location.pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </Button>
            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/profile/${username}`)} className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {username || "User"}
                </button>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Join Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${location.pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                {user ? (
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleSignOut}>
                    Sign Out ({username})
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
                      Sign In
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
                      Join Now
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
