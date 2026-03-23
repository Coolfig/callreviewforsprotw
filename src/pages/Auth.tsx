import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

type AuthMode = "login" | "signup" | "forgot-password" | "forgot-username";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameForReset, setUsernameForReset] = useState("");
  const [emailForUsername, setEmailForUsername] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    if (username.trim().length < 3) {
      toast({ title: "Username must be at least 3 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      toast({ title: "Username already taken", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: username.trim().toLowerCase() },
      },
    });

    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a verification link. Verify your email to sign in." });
      setMode("login");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Allow login with username or email
    let loginEmail = email.trim();
    if (!loginEmail.includes("@")) {
      // Treat as username, look up email
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("username", loginEmail.toLowerCase())
        .maybeSingle();
      
      if (!profile) {
        toast({ title: "Username not found", variant: "destructive" });
        setLoading(false);
        return;
      }
      // We can't get email from profiles, so ask user to use email
      toast({ title: "Please use your email to sign in", description: "Enter the email associated with your account.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameForReset.trim()) {
      toast({ title: "Enter your username", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Look up the user's email from their username via edge function
    const { data, error } = await supabase.functions.invoke("forgot-password", {
      body: { username: usernameForReset.trim().toLowerCase() },
    });

    setLoading(false);
    if (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } else {
      toast({ title: "If that username exists, a password reset link was sent to the associated email." });
      setMode("login");
    }
  };

  const handleForgotUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForUsername.trim()) {
      toast({ title: "Enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("forgot-username", {
      body: { email: emailForUsername.trim() },
    });

    setLoading(false);
    if (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } else {
      toast({ title: "If that email is registered, we sent your username to it." });
      setMode("login");
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Call<span className="text-primary">Review</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-4">
            {mode === "login" && "Welcome back"}
            {mode === "signup" && "Join CallReview"}
            {mode === "forgot-password" && "Reset password"}
            {mode === "forgot-username" && "Forgot username"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login" && "Sign in to vote, comment, and debate calls."}
            {mode === "signup" && "Create an account to join the discussion."}
            {mode === "forgot-password" && "Enter your username and we'll email a reset link."}
            {mode === "forgot-username" && "Enter your email and we'll send your username."}
          </p>
        </div>

        {/* Login */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
            <div className="flex justify-between text-xs">
              <button type="button" onClick={() => setMode("forgot-username")} className="text-muted-foreground hover:text-foreground transition-colors">
                Forgot username?
              </button>
              <button type="button" onClick={() => setMode("forgot-password")} className="text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* Signup */}
        {mode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="refexpert22" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Join Now"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* Forgot Password */}
        {mode === "forgot-password" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-username">Username</Label>
              <Input id="reset-username" placeholder="Your username" value={usernameForReset} onChange={e => setUsernameForReset(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
            <button type="button" onClick={() => setMode("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          </form>
        )}

        {/* Forgot Username */}
        {mode === "forgot-username" && (
          <form onSubmit={handleForgotUsername} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recover-email">Email</Label>
              <Input id="recover-email" type="email" placeholder="you@email.com" value={emailForUsername} onChange={e => setEmailForUsername(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send My Username"}
            </Button>
            <button type="button" onClick={() => setMode("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
