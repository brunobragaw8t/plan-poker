import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./routes/RootLayout";
import { HomePage } from "./routes/HomePage";
import { SessionPage } from "./routes/SessionPage";
import { JoinPage } from "./routes/JoinPage";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/session/$slug",
  component: SessionPage,
});

const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$slug",
  component: JoinPage,
});

const routeTree = rootRoute.addChildren([homeRoute, sessionRoute, joinRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
