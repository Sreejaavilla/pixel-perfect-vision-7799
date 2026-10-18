import { useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase-client";
import { Shield, Key, Mail, User, AlertCircle, CheckCircle2, LogOut } from "lucide-react";

interface AuthModalProps {
  user: { id: string; email?: string; username?: string; role?: string } | null;
  onAuthChange: () => void;
  onClose: () => void;
}

export function AuthModal({ user, onAuthChange, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured || !supabase) {
      setError(
        "Supabase credentials are not configured yet. Add VITE_SUPABASE_ANON_KEY to your .env to enable cloud accounts.",
      );
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim() || email.split("@")[0],
            },
          },
        });

        if (signUpError) throw signUpError;
        if (data.session) {
          setSuccess("Account created and signed in successfully.");
          onAuthChange();
          setTimeout(onClose, 1000);
        } else {
          setSuccess("Confirmation email sent. Please check your inbox to verify your account.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        setSuccess("Signed in successfully.");
        onAuthChange();
        setTimeout(onClose, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    onAuthChange();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm font-bold tracking-widest">
              {user ? "INVESTIGATOR CREDENTIALS" : isSignUp ? "REGISTER PARTICIPANT" : "SIGN IN"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-mono text-xs"
          >
            [ESC / CLOSE]
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-4 border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
            <div className="flex items-center gap-1.5 font-mono font-bold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              DATABASE CREDENTIALS PENDING
            </div>
            <p className="mt-1 leading-relaxed text-[11px] text-muted-foreground">
              Real Supabase keys are not yet configured in <code>.env</code>. The application is
              running in <strong>Offline Investigator Mode</strong> with local score validation.
            </p>
          </div>
        )}

        {user ? (
          <div className="mt-5 space-y-4 font-mono text-xs">
            <div className="border border-border bg-background p-3 space-y-2">
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider">
                Active Investigator
              </div>
              <div className="text-foreground font-bold">{user.username || user.email}</div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground">ROLE:</span>
                <span className="rounded bg-primary/10 border border-primary/30 px-1.5 py-0.5 text-primary uppercase">
                  {user.role || "participant"}
                </span>
                <span className="text-muted-foreground">ID:</span>
                <span className="text-muted-foreground">{user.id.slice(0, 8)}...</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 border border-destructive/40 bg-destructive/10 px-4 py-2.5 font-mono text-xs text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" /> SIGN OUT
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="mt-5 space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Investigator Call-sign / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. agent_keller"
                    className="w-full border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@agency.internal"
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && (
              <div className="border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="font-mono text-[11px] text-muted-foreground hover:text-primary underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in here"
                  : "Need a participant profile? Register here"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
