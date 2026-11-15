import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./GoogleIcon";
import { signInWithProvider } from "@/lib/authMfaFlow";
import { returnToSearch } from "@/lib/authReturnTo";
import { useI18n } from "@/lib/i18n";

// Small pieces the auth pages share.

export function AuthError({ children }) {
  const { t } = useI18n();
  if (!children) return null;
  return (
    <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      {t(children)}
    </div>
  );
}

export function SubmitButton({ busy, busyLabel, children, ...props }) {
  const { t } = useI18n();
  return (
    <Button type="submit" className="h-12 w-full font-medium" disabled={busy} {...props}>
      {busy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {t(busyLabel)}
        </>
      ) : (
        t(children)
      )}
    </Button>
  );
}

export function GoogleButton({ returnTo, onError }) {
  const { t } = useI18n();
  return (
    <Button
      type="button"
      variant="outline"
      className="mb-6 h-12 w-full text-sm font-medium"
      onClick={() => signInWithProvider("google", returnTo).catch((err) => onError(err.message || "Unable to sign in with Google"))}
    >
      <GoogleIcon className="mr-2 h-5 w-5" />
      {t("Continue with Google")}
    </Button>
  );
}

export function OrDivider() {
  const { t } = useI18n();
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">{t("or")}</span>
      </div>
    </div>
  );
}

// A link between auth screens that carries the way back (?returnTo=) along.
export function AuthLink({ to, returnTo, className = "font-medium text-primary hover:underline", children }) {
  return (
    <Link to={to} search={returnToSearch(returnTo)} className={className}>
      {children}
    </Link>
  );
}