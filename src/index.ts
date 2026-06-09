import {
  currentRoute,
  globalRoutes,
  updateCurrentRoute,
  routerKey,
  routeLocationKey,
  routerViewLocationKey,
  matchedRouteKey,
  viewDepthKey,
  ROUTER_KEY,
  router,
  registerVue,
  currentRouteProxy,
  VueInstance,
  vueRouteObject,
  getGlobalRouterState,
  type RouteRecord,
  type RouteLocation,
  type RouteComponent,
  type ReactiveRoute,
  type RouteSubscriber,
} from "./history";
import { RouterLink, useLink } from "./RouterLink";
import { RouterView } from "./RouterView";

export {
  currentRoute,
  globalRoutes,
  routerKey,
  routeLocationKey,
  routerViewLocationKey,
  matchedRouteKey,
  viewDepthKey,
  ROUTER_KEY,
  router,
  registerVue,
  getGlobalRouterState,
};
export type {
  RouteRecord,
  RouteLocation,
  RouteComponent as MountableComponent,
  ReactiveRoute,
  RouteSubscriber,
};
export type Router = typeof router;
export type RouteLocationNormalized = RouteLocation;
export type RouteLocationNormalizedLoaded = RouteLocation;
export type RouteRecordRaw = RouteRecord;
export { RouterLink, RouterView, useLink };
export {
  isNavigationFailure,
  NavigationFailureType,
  ErrorTypes,
} from "./errors";

export interface RouterOptions {
  history?: any;
  routes: RouteRecord[];
}

export function createRouter(options: RouterOptions) {
  if (options.routes) {
    for (const route of options.routes) {
      const existingIdx = globalRoutes.findIndex((r: RouteRecord) => r.path === route.path);
      if (existingIdx >= 0) {
        globalRoutes[existingIdx] = route;
      } else {
        globalRoutes.push(route);
      }
    }
  }
  router.options = options;

  const initialPath =
    window.location.pathname + window.location.search + window.location.hash;
  updateCurrentRoute(initialPath);

  return router;
}

export function createWebHistory(base = "") {
  return {
    base,
    get location() {
      return (
        window.location.pathname + window.location.search + window.location.hash
      );
    },
    get state() {
      return window.history.state;
    },
    push(to: string, _data?: any) {
      const state = _data ? { ..._data, current: to } : { current: to };
      window.history.pushState(state, "", to);
    },
    replace(to: string, _data?: any) {
      const state = _data ? { ..._data, current: to } : { current: to };
      window.history.replaceState(state, "", to);
    },
    go(delta: number) {
      window.history.go(delta);
    },
    listen(callback: any) {
      const handler = () => {
        callback(this.location, this.location, {
          type: "pop",
          direction: "",
          delta: 0,
        } as any);
      };
      window.addEventListener("popstate", handler);
      return () => window.removeEventListener("popstate", handler);
    },
    createHref(location: string) {
      return base + location;
    },
    destroy() {},
  };
}

export function createWebHashHistory(base = "") {
  return {
    base,
    get location() {
      return window.location.hash.slice(1) || "/";
    },
    get state() {
      return window.history.state;
    },
    push(to: string, _data?: any) {
      const state = _data
        ? { ..._data, current: "#" + to }
        : { current: "#" + to };
      window.history.pushState(state, "", "#" + to);
    },
    replace(to: string, _data?: any) {
      const state = _data
        ? { ..._data, current: "#" + to }
        : { current: "#" + to };
      window.history.replaceState(state, "", "#" + to);
    },
    go(delta: number) {
      window.history.go(delta);
    },
    listen(callback: any) {
      const handler = () => {
        callback(this.location, this.location, {
          type: "pop",
          direction: "",
          delta: 0,
        } as any);
      };
      window.addEventListener("popstate", handler);
      return () => window.removeEventListener("popstate", handler);
    },
    createHref(location: string) {
      return "#" + location;
    },
    destroy() {},
  };
}

export function createMemoryHistory(base = "") {
  let index = 0;
  const entries = ["/"];
  return {
    base,
    get location() {
      return entries[index];
    },
    get state() {
      return {};
    },
    push(to: string, _data?: any) {
      entries.splice(index + 1);
      entries.push(to);
      index++;
    },
    replace(to: string, _data?: any) {
      entries[index] = to;
    },
    go(delta: number) {
      index = Math.max(0, Math.min(entries.length - 1, index + delta));
    },
    listen(_callback: any) {
      return () => {};
    },
    createHref(location: string) {
      return location;
    },
    destroy() {},
  };
}

export function useRouter() {
  return router;
}

export function useRoute() {
  if (VueInstance && vueRouteObject) {
    return vueRouteObject;
  }
  return currentRouteProxy;
}
