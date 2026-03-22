import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

import { getUserProfile, login, googleLogin, type UserProfile } from "../../api/auth";
import { Button } from "../../components/Button";
import { useAuthStore } from "../../store/authStore";
import { AuthShell } from "./AuthShell";

function needsOnboarding(profile: UserProfile) {
  return !profile.business_type?.trim();
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/";
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      setSession({ token: res.access_token, userEmail: email.trim() });

      try {
        const profile = await getUserProfile();
        setSession({ token: res.access_token, user: profile });

        if (needsOnboarding(profile)) {
          toast.info("Complete your profile to continue.");
          navigate("/profile?onboarding=1", { replace: true });
          return;
        }
      } catch {
        // Keep existing behavior if profile fetch fails.
      }

      toast.success("Logged in.");
      navigate(from, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-5">
        <div className="text-xl font-black text-[var(--sbpa-dark)]">Welcome back</div>
        <div className="text-sm text-[var(--sbpa-dark)]/60">Log in to start an analysis.</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
            placeholder="you@company.com"
          />
          {errors.email ? <div className="mt-1 text-xs font-semibold text-red-700">{errors.email}</div> : null}
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
            placeholder="••••••••"
          />
          {errors.password ? (
            <div className="mt-1 text-xs font-semibold text-red-700">{errors.password}</div>
          ) : null}
        </div>

        <Button disabled={submitting} type="submit" className="w-full">
          {submitting ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px w-full bg-[var(--sbpa-dark)]/10" />
        <div className="text-xs font-semibold uppercase text-[var(--sbpa-dark)]/40">OR</div>
        <div className="h-px w-full bg-[var(--sbpa-dark)]/10" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (!credentialResponse.credential) return;
            setSubmitting(true);
            try {
              const payloadBase64 = credentialResponse.credential.split('.')[1];
              const decodedStr = atob(payloadBase64);
              const payload = JSON.parse(decodedStr);
              const userEmail = payload.email;

              const res = await googleLogin(credentialResponse.credential);
              setSession({ token: res.access_token, userEmail });

              try {
                const profile = await getUserProfile();
                setSession({ token: res.access_token, user: profile });

                if (needsOnboarding(profile)) {
                  toast.info("Complete your profile to continue.");
                  navigate("/profile?onboarding=1", { replace: true });
                  return;
                }
              } catch {
                // Keep existing behavior if profile fetch fails.
              }

              toast.success("Successfully logged in.");
              navigate(from, { replace: true });
            } catch (err: any) {
              toast.error(err.response?.data?.detail || "Google Login failed.");
            } finally {
              setSubmitting(false);
            }
          }}
          onError={() => {
            toast.error("Google Login popup closed or failed.");
          }}
          useOneTap
        />
      </div>

      <div className="mt-4 text-sm text-[var(--sbpa-dark)]/60">
        No account?{" "}
        <Link className="font-semibold underline" to="/register">
          Register
        </Link>
      </div>
    </AuthShell>
  );
}

