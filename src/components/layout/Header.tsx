import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, LogOut, User, Bell, MessageSquare, Settings, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { timeAgo } from "@/lib/utils/timeAgo";
import refereeCharacter from "@/assets/referee-character.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, username, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications(user?.id);

  const navLinks = [
    { name: "Feed", href: "/feed" },
    { name: "Community", href: "/community" },
    { name: "Rules", href: "/rules" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "About", href: "/about" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-10 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
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
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/search")}>
              <Search className="w-5 h-5" />
            </Button>

            {user && (
              <>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/bookmarks")}>
                  <Bookmark className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/messages")}>
                  <MessageSquare className="w-5 h-5" />
                </Button>

                {/* Notifications bell */}
                <div className="relative">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="text-sm font-bold">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <button
                              key={n.id}
                              onClick={() => {
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                                if (!n.is_read) markOneRead(n.id);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/30 ${!n.is_read ? "bg-primary/5" : ""}`}
                            >
                              <p className="text-sm font-medium">{n.title}</p>
                              {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                              <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4" />
                </Button>

                <button onClick={() => navigate(`/profile/${username}`)} className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5 ml-1">
                  <User className="w-4 h-4" />
                  {username || "User"}
                </button>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}

            {!user && (
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
              {user && (
                <>
                  <Link to="/messages" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                  <Link to="/bookmarks" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Bookmarks</Link>
                  <Link to="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Settings</Link>
                  <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Search</Link>
                </>
              )}
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

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
      )}
    </header>
  );
};

export default Header;
