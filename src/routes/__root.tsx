import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-soft/40 via-background to-amber-soft/30 px-4">
      <div className="max-w-md text-center">
        <div className="text-8xl">🦉</div>
        <h1 className="mt-6 text-4xl font-extrabold text-foreground">Hoot! Page not found.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for must have flown away. Let's get you back on track.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:brightness-105"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OwlCV — AI Resume Builder" },
      { name: "description", content: "Build, optimize, and share beautiful resumes with AI. Free to start, no credit card required." },
      { name: "author", content: "OwlCV" },
      { property: "og:title", content: "OwlCV — AI Resume Builder" },
      { property: "og:description", content: "Build, optimize, and share beautiful resumes with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
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
  return <Outlet />;
}
