import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ProfileProvider } from "@/lib/profile";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AgriSmart AI — Smart Farming with AI" },
      { name: "description", content: "AI-powered farmer support platform: crop recommendations, disease detection, market intelligence, and government schemes — all in one place." },
      { name: "author", content: "AgriSmart AI" },
      { property: "og:title", content: "AgriSmart AI — Smart Farming with AI" },
      { property: "og:description", content: "AI-powered farmer support platform for Indian agriculture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <LanguageProvider>
      <ProfileProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </ProfileProvider>
    </LanguageProvider>
  );
}

