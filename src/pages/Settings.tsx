import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  User, Key, Shield, Bell, Eye, HelpCircle, ChevronRight, LogOut, Trash2,
} from "lucide-react";

const settingsSections = [
  { id: "account", label: "Your account", icon: User },
  { id: "password", label: "Change your password", icon: Key },
  { id: "privacy", label: "Privacy and safety", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "display", label: "Accessibility, display, and languages", icon: Eye },
  { id: "help", label: "Help Center", icon: HelpCircle },
];

const Settings = () => {
  const { user, username, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({ title: "Please enter your current password", variant: "destructive" });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSaving(true);
    // Re-authenticate with current password first
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPassword,
    });
    if (authError) {
      setSaving(false);
      toast({ title: "Current password is incorrect", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setCurrentPassword("");
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to sign out? Account deactivation is not yet available.")) return;
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 text-center">
          <p className="text-muted-foreground">Please sign in to access settings.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-5xl mx-auto flex min-h-[calc(100vh-4rem)]">
          {/* Left sidebar */}
          <div className="w-80 border-r border-border p-6 hidden md:block">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <nav className="space-y-1">
              {settingsSections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  <span>{s.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile header */}
          <div className="md:hidden w-full">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
            <div className="flex overflow-x-auto gap-2 p-3 border-b border-border">
              {settingsSections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeSection === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-10">
            {activeSection === "account" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Your Account</h2>
                <p className="text-sm text-muted-foreground mb-8">See information about your account.</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 rounded-xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Account information</p>
                      <p className="text-xs text-muted-foreground">Username: @{username} · Email: {user.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <button onClick={() => setActiveSection("password")} className="flex items-center gap-4 p-5 rounded-xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer w-full text-left">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Change your password</p>
                      <p className="text-xs text-muted-foreground">Change your password at any time.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <button onClick={handleDeactivate} className="flex items-center gap-4 p-5 rounded-xl border border-border hover:bg-destructive/10 transition-colors cursor-pointer w-full text-left">
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-destructive">Deactivate your account</p>
                      <p className="text-xs text-muted-foreground">Find out how you can deactivate your account.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {activeSection === "password" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Change your password</h2>
                <p className="text-sm text-muted-foreground mb-8">Update your password to keep your account secure.</p>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current password</label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">New password</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                  </div>
                  <Button onClick={handleChangePassword} disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Privacy and Safety</h2>
                <p className="text-sm text-muted-foreground mb-8">Manage your privacy settings and how your data is used.</p>
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-border">
                    <p className="text-sm font-semibold">Profile visibility</p>
                    <p className="text-xs text-muted-foreground mt-1">Your profile is currently public. All users can see your posts and profile information.</p>
                  </div>
                  <div className="p-5 rounded-xl border border-border">
                    <p className="text-sm font-semibold">Direct messages</p>
                    <p className="text-xs text-muted-foreground mt-1">Anyone can send you a direct message.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Notifications</h2>
                <p className="text-sm text-muted-foreground mb-8">Manage your notification preferences.</p>
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-border">
                    <p className="text-sm font-semibold">Push notifications</p>
                    <p className="text-xs text-muted-foreground mt-1">In-app notifications are enabled for new followers and messages.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "display" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Accessibility, Display, and Languages</h2>
                <p className="text-sm text-muted-foreground mb-8">Customize your display preferences.</p>
                <div className="p-5 rounded-xl border border-border">
                  <p className="text-sm font-semibold">Dark mode</p>
                  <p className="text-xs text-muted-foreground mt-1">The app currently uses dark mode by default.</p>
                </div>
              </div>
            )}

            {activeSection === "help" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Help Center</h2>
                <p className="text-sm text-muted-foreground mb-8">Get help with your account and learn about the platform.</p>
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-border">
                    <p className="text-sm font-semibold">About CallReview</p>
                    <p className="text-xs text-muted-foreground mt-1">CallReview is a platform for evidence-based sports analysis, where fans review controversial plays using official league rules.</p>
                  </div>
                  <div className="p-5 rounded-xl border border-border">
                    <p className="text-sm font-semibold">Contact Support</p>
                    <p className="text-xs text-muted-foreground mt-1">Email us at support@callreview.com</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
