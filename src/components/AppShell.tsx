import { type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { OfflineBanner } from "./OfflineBanner";
import { OnboardingModal } from "./OnboardingModal";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-glow"
      >
        Skip to main content
      </a>
      <Navbar />
      <OfflineBanner />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <OnboardingModal />
    </div>
  );
}
