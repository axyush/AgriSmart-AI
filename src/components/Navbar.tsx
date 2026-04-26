import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Menu, X, Globe, Check, LogOut, User as UserIcon, LogIn } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { LANGUAGES, Lang } from "@/i18n/translations";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_KEYS: { to: string; key: string }[] = [
  { to: "/", key: "nav.home" },
  { to: "/dashboard", key: "nav.dashboard" },
  { to: "/assistant", key: "nav.assistant" },
  { to: "/crops", key: "nav.crops" },
  { to: "/diseases", key: "nav.diseases" },
  { to: "/market", key: "nav.market" },
  { to: "/schemes", key: "nav.schemes" },
  { to: "/expert", key: "nav.expert" },
  { to: "/history", key: "nav.history" },
  { to: "/about", key: "nav.about" },
];

export function Navbar() {
  const { t, lang, setLang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("auth.signedOut"));
    navigate({ to: "/" });
  };

  const userInitial = (user?.user_metadata?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
            <Leaf className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight">{t("brand.name")}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_KEYS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-muted transition-colors">
              <Globe className="h-3.5 w-3.5" />
              {LANGUAGES.find((l) => l.code === lang)?.native}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code as Lang)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{l.label}</span>
                  {lang === l.code && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                aria-label={t("auth.account")}
              >
                {userInitial}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate">
                      {user?.user_metadata?.name || t("auth.account")}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })} className="cursor-pointer">
                  <UserIcon className="h-4 w-4 mr-2" />
                  {t("nav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("auth.signout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("auth.signin.btn")}
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in-up">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {NAV_KEYS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={[
                  "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.to)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                ].join(" ")}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
