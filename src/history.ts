import { matchRoute, findFullPathByName } from "./matcher";

// ─── Reactive Route (replaces Vue's shallowRef) ───────────────────────

export type RouteSubscriber = (
  newRoute: RouteLocation,
  oldRoute: RouteLocation,
) => void;

export interface ReactiveRoute {
  value: RouteLocation;
  subscribe(cb: RouteSubscriber): () => void;
}

function createReactiveRoute(initial: RouteLocation): ReactiveRoute {
  let _value = initial;
  const _subscribers = new Set<RouteSubscriber>();

  return new Proxy({} as ReactiveRoute, {
    get(_target, prop) {
      if (prop === "value") return _value;
      if (prop === "subscribe")
        return (cb: RouteSubscriber) => {
          _subscribers.add(cb);
          return () => {
            _subscribers.delete(cb);
          };
        };
      return undefined;
    },
    set(_target, prop, newValue) {
      if (prop === "value") {
        const oldValue = _value;
        _value = newValue;
        _subscribers.forEach((cb) => cb(newValue, oldValue));
        return true;
      }
      return false;
    },
  });
}

// ─── Types ────────────────────────────────────────────────────────────

export interface RouteComponent {
  mount(container: HTMLElement): void | Promise<void>;
  unmount(container: HTMLElement): void | Promise<void>;
}

export interface RouteRecord {
  path: string;
  name?: string | null;
  component?: RouteComponent;
  meta?: any;
  redirect?: any;
  children?: RouteRecord[];
}

export interface RouteLocation {
  path: string;
  name?: string | null;
  params: Record<string, string>;
  query: Record<string, any>;
  hash: string;
  fullPath: string;
  matched: RouteRecord[];
  meta: any;
  redirectedFrom?: RouteLocation;
}

// ─── Global State ─────────────────────────────────────────────────────

const DEFAULT_ROUTE: RouteLocation = {
  path: window.location.pathname,
  fullPath:
    window.location.pathname + window.location.search + window.location.hash,
  name: undefined,
  params: {},
  query: {},
  hash: window.location.hash,
  matched: [],
  meta: {},
  redirectedFrom: undefined,
};

export function getGlobalRouterState() {
  if (!(window as any).__MICROTSM_ROUTER__) {
    (window as any).__MICROTSM_ROUTER__ = {
      globalRoutes: [] as RouteRecord[],
      currentRoute: createReactiveRoute(DEFAULT_ROUTE),
      middlewares: new Set<(to: URL) => Promise<boolean> | boolean>(),
      beforeEachGuards: new Set<any>(),
      beforeResolveGuards: new Set<any>(),
      afterEachHooks: new Set<any>(),
      isNavigationCanceled: false,
      isHistoryPatched: false,
      originalPushState: window.history.pushState.bind(window.history),
      originalReplaceState: window.history.replaceState.bind(window.history),
    };
  }
  return (window as any).__MICROTSM_ROUTER__;
}

const globalState = getGlobalRouterState();

export const globalRoutes = globalState.globalRoutes;
export const currentRoute = globalState.currentRoute;

// Plain symbols (no Vue InjectionKey)
export const routerKey = Symbol("router");
export const routeLocationKey = Symbol("route location");
export const routerViewLocationKey = Symbol("router view location");
export const matchedRouteKey = Symbol("router view location matched");
export const viewDepthKey = Symbol("router view depth");
export const ROUTER_KEY = Symbol("microtsm-router");

// ─── Vue Reactivity Bridge ───────────────────────────────────────────
export let VueInstance: any = null;
export let vueRouteRef: any = null;
export let vueRouteObject: any = null;

export function registerVue(Vue: any) {
  VueInstance = Vue;
  vueRouteRef = VueInstance.shallowRef(currentRoute.value);

  vueRouteObject = VueInstance.reactive({
    path: currentRoute.value.path,
    fullPath: currentRoute.value.fullPath,
    name: currentRoute.value.name,
    params: currentRoute.value.params,
    query: currentRoute.value.query,
    hash: currentRoute.value.hash,
    matched: currentRoute.value.matched,
    meta: currentRoute.value.meta,
    redirectedFrom: currentRoute.value.redirectedFrom,
  });

  currentRoute.subscribe((newRoute: RouteLocation) => {
    if (vueRouteRef) vueRouteRef.value = newRoute;
    if (vueRouteObject) {
      vueRouteObject.path = newRoute.path;
      vueRouteObject.fullPath = newRoute.fullPath;
      vueRouteObject.name = newRoute.name;
      vueRouteObject.params = newRoute.params;
      vueRouteObject.query = newRoute.query;
      vueRouteObject.hash = newRoute.hash;
      vueRouteObject.matched = newRoute.matched;
      vueRouteObject.meta = newRoute.meta;
      vueRouteObject.redirectedFrom = newRoute.redirectedFrom;
    }
  });

  router.install = (app: any) => {
    app.provide(routerKey, router);
    app.provide(routeLocationKey, vueRouteObject);
    app.config.globalProperties.$router = router;
    app.config.globalProperties.$route = vueRouteObject;
  };
}

export const currentRouteProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "value") return currentRoute.value;
      if (prop === "subscribe") return currentRoute.subscribe;
      return (currentRoute.value as any)[prop];
    },
  },
) as any;

// ─── Query Parsing ────────────────────────────────────────────────────

export function parseQuery(search: string): Record<string, any> {
  const query: Record<string, any> = {};
  if (!search) return query;
  const queryStr = search.startsWith("?") ? search.slice(1) : search;
  const searchParams = new URLSearchParams(queryStr);
  searchParams.forEach((value, key) => {
    if (query[key] !== undefined) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  });
  return query;
}

// ─── Route Update ─────────────────────────────────────────────────────

export function updateCurrentRoute(path: string) {
  let pathname = path;
  let search = "";
  let hash = "";

  const hashIdx = path.indexOf("#");
  if (hashIdx >= 0) {
    hash = path.slice(hashIdx);
    pathname = path.slice(0, hashIdx);
  }
  const qIdx = pathname.indexOf("?");
  if (qIdx >= 0) {
    search = pathname.slice(qIdx);
    pathname = pathname.slice(0, qIdx);
  }

  if (pathname === window.location.pathname) {
    if (!search) search = window.location.search;
    if (!hash) hash = window.location.hash;
  }

  const query = parseQuery(search);
  const match = matchRoute(globalRoutes, pathname);

  let matchedPath = pathname;
  if (match) {
    matchedPath = match.path;
  }

  const fullPath = matchedPath + search + hash;
  if (matchedPath !== pathname || !window.history.state) {
    const globalState = getGlobalRouterState();
    globalState.originalReplaceState.call(
      window.history,
      { current: fullPath, ...(window.history.state || {}) },
      "",
      fullPath,
    );
  }

  const previousRoute = { ...currentRoute.value };
  currentRoute.value = {
    path: matchedPath,
    fullPath: matchedPath + search + hash,
    name: match?.route.name || undefined,
    params: match?.params || {},
    query: query,
    hash: hash,
    matched: match?.matched || [],
    meta: match
      ? match.matched.reduce((acc, r) => ({ ...acc, ...r.meta }), {})
      : {},
    redirectedFrom: undefined,
  };

  const toRoute = currentRoute.value;
  const globalState = getGlobalRouterState();
  for (const hook of globalState.afterEachHooks) {
    try {
      hook(toRoute, previousRoute);
    } catch (err) {
      console.error("Error in afterEach hook:", err);
    }
  }

  window.dispatchEvent(
    new CustomEvent("microtsm:router-change", {
      detail: { path: matchedPath + search + hash },
    }),
  );
}

// ─── Router Object ────────────────────────────────────────────────────

export const router = {
  get currentRoute() {
    return vueRouteRef || currentRoute;
  },
  listening: true,
  options: {
    history: null,
    routes: [] as RouteRecord[],
  } as any,

  addRoute(_parentNameOrRoute: any, _route?: any) {},
  removeRoute(_name: any) {},
  clearRoutes() {},
  hasRoute(_name: any) {
    return false;
  },
  getRoutes() {
    return this.options.routes;
  },

  resolve(to: any) {
    let path = "";
    if (typeof to === "string") {
      path = to;
    } else if (to && typeof to === "object") {
      if (to.name) {
        const resolvedPath = findFullPathByName(globalRoutes, to.name);
        path = resolvedPath || "";
      } else {
        path = to.path || "";
      }

      if (to.params && path.includes(":")) {
        for (const [key, val] of Object.entries(to.params)) {
          path = path.replace(`:${key}`, String(val));
        }
      }

      if (to.query) {
        const queryStr = new URLSearchParams(to.query).toString();
        if (queryStr) path += "?" + queryStr;
      }
      if (to.hash) {
        path += to.hash.startsWith("#") ? to.hash : "#" + to.hash;
      }
    }

    let pathname = path;
    const qIdx = pathname.indexOf("?");
    if (qIdx >= 0) pathname = pathname.slice(0, qIdx);
    const hIdx = pathname.indexOf("#");
    if (hIdx >= 0) pathname = pathname.slice(0, hIdx);

    const match = matchRoute(globalRoutes, pathname);
    const matchedPath = match ? match.path : pathname;
    const searchPart = path.includes("?") ? path.slice(path.indexOf("?")) : "";
    const hashPart = path.includes("#") ? path.slice(path.indexOf("#")) : "";

    return {
      path: matchedPath,
      fullPath: matchedPath + searchPart + hashPart,
      name: match?.route.name || undefined,
      params: match?.params || {},
      query:
        typeof to === "object" && to.query ? to.query : parseQuery(searchPart),
      hash: typeof to === "object" && to.hash ? to.hash : hashPart,
      matched: match?.matched || [],
      meta: match
        ? match.matched.reduce((acc, r) => ({ ...acc, ...r.meta }), {})
        : {},
      href: matchedPath + searchPart + hashPart,
    };
  },

  async push(to: any): Promise<void> {
    const resolved = this.resolve(to);
    window.history.pushState(
      { current: resolved.fullPath },
      "",
      resolved.fullPath,
    );
  },

  async replace(to: any): Promise<void> {
    const resolved = this.resolve(to);
    window.history.replaceState(
      { current: resolved.fullPath },
      "",
      resolved.fullPath,
    );
  },

  back(): void {
    window.history.back();
  },

  forward(): void {
    window.history.forward();
  },

  go(delta: number): void {
    window.history.go(delta);
  },

  beforeEach(guard: any) {
    const globalState = getGlobalRouterState();
    globalState.beforeEachGuards.add(guard);
    return () => {
      globalState.beforeEachGuards.delete(guard);
    };
  },
  beforeResolve(guard: any) {
    const globalState = getGlobalRouterState();
    globalState.beforeResolveGuards.add(guard);
    return () => {
      globalState.beforeResolveGuards.delete(guard);
    };
  },
  afterEach(hook: any) {
    const globalState = getGlobalRouterState();
    globalState.afterEachHooks.add(hook);
    return () => {
      globalState.afterEachHooks.delete(hook);
    };
  },
  onError(_handler: any) {
    return () => {};
  },
  isReady() {
    return Promise.resolve();
  },

  install: null as any,
};

// ─── History API Patching & Middlewares ────────────────────────────────

export function patchHistoryStateEvents() {
  const globalState = getGlobalRouterState();
  if (globalState.isHistoryPatched) return;

  console.log("🔧 patchHistoryStateEvents: Modifying history.pushState and history.replaceState.");

  window.history.pushState = (...args) => {
    const payload = {
      to: new URL(args[2] ?? window.location.pathname, window.location.origin),
      from: new URL(window.location.href),
      cancelNavigation: () => {
        globalState.isNavigationCanceled = true;
      },
    };

    if (payload.to.href !== payload.from.href) {
      window.dispatchEvent(
        new CustomEvent("microtsm:before-navigation-event", { detail: payload })
      );
    }

    runMiddlewares(payload.to).then((isAllowed) => {
      if (isAllowed) {
        if (!globalState.isNavigationCanceled) {
          console.log("📢 pushState triggered in router:", args);
          globalState.originalPushState.apply(window.history, args);

          if (payload.to.href !== payload.from.href) {
            window.dispatchEvent(
              new CustomEvent("microtsm:navigation-event", { detail: payload })
            );
          }

          const fullPath = payload.to.pathname + payload.to.search + payload.to.hash;
          updateCurrentRoute(fullPath);
        }
        globalState.isNavigationCanceled = false;
      }
    });
  };

  window.history.replaceState = (...args) => {
    const payload = {
      to: new URL(args[2] ?? window.location.pathname, window.location.origin),
      from: new URL(window.location.href),
      cancelNavigation: () => {
        globalState.isNavigationCanceled = true;
      },
    };

    if (payload.to.href !== payload.from.href) {
      window.dispatchEvent(
        new CustomEvent("microtsm:before-navigation-event", { detail: payload })
      );
    }

    runMiddlewares(payload.to).then((isAllowed) => {
      if (isAllowed) {
        if (!globalState.isNavigationCanceled) {
          console.log("📢 replaceState triggered in router:", args);
          globalState.originalReplaceState.apply(window.history, args);

          if (payload.to.href !== payload.from.href) {
            window.dispatchEvent(
              new CustomEvent("microtsm:navigation-event", { detail: payload })
            );
          }

          const fullPath = payload.to.pathname + payload.to.search + payload.to.hash;
          updateCurrentRoute(fullPath);
        }
        globalState.isNavigationCanceled = false;
      }
    });
  };

  globalState.isHistoryPatched = true;
}

export async function runVueNavigationGuards(toUrl: URL): Promise<boolean | string | object> {
  const globalState = getGlobalRouterState();
  const toRoute = router.resolve(toUrl.pathname + toUrl.search + toUrl.hash);
  const fromRoute = globalState.currentRoute.value;

  // 1. Run beforeEach guards
  for (const guard of globalState.beforeEachGuards) {
    let result: any;
    if (guard.length >= 3) {
      result = await new Promise((resolve) => {
        guard(toRoute, fromRoute, (nextResult: any) => {
          resolve(nextResult !== undefined ? nextResult : true);
        });
      });
    } else {
      result = await guard(toRoute, fromRoute);
    }

    if (result === false) return false;
    if (typeof result === "string" || (result && typeof result === "object")) {
      return result;
    }
  }

  // 2. Run beforeResolve guards
  for (const guard of globalState.beforeResolveGuards) {
    let result: any;
    if (guard.length >= 3) {
      result = await new Promise((resolve) => {
        guard(toRoute, fromRoute, (nextResult: any) => {
          resolve(nextResult !== undefined ? nextResult : true);
        });
      });
    } else {
      result = await guard(toRoute, fromRoute);
    }

    if (result === false) return false;
    if (typeof result === "string" || (result && typeof result === "object")) {
      return result;
    }
  }

  return true;
}

export async function runMiddlewares(to: URL): Promise<boolean> {
  const globalState = getGlobalRouterState();
  for (const middleware of globalState.middlewares) {
    const isAllowed = await middleware(to);
    if (!isAllowed) {
      console.warn(`🚫 Route blocked by global middleware: ${to.pathname}`);
      return false;
    }
  }

  const guardResult = await runVueNavigationGuards(to);
  if (guardResult === false) {
    console.warn(`🚫 Route blocked by router navigation guards: ${to.pathname}`);
    return false;
  }
  if (typeof guardResult === "string" || (guardResult && typeof guardResult === "object")) {
    console.log(`🔄 Redirecting to:`, guardResult);
    setTimeout(() => {
      router.push(guardResult);
    }, 0);
    return false;
  }

  return true;
}

// ─── Event Listeners ──────────────────────────────────────────────────

window.addEventListener("popstate", (e) => {
  const toUrl = new URL(window.location.href);
  runMiddlewares(toUrl).then((isAllowed) => {
    if (isAllowed) {
      const fullPath = toUrl.pathname + toUrl.search + toUrl.hash;
      updateCurrentRoute(fullPath);
    } else {
      const globalState = getGlobalRouterState();
      const previousFullPath = globalState.currentRoute.value.fullPath;
      globalState.originalReplaceState.call(
        window.history,
        e.state,
        "",
        previousFullPath
      );
    }
  });
});

window.addEventListener("microtsm:navigation-event", ((e: Event) => {
  const customEvent = e as CustomEvent<{ to: URL; from: URL }>;
  if (customEvent.detail && customEvent.detail.to) {
    const toUrl = customEvent.detail.to;
    const fullPath = toUrl.pathname + toUrl.search + toUrl.hash;
    updateCurrentRoute(fullPath);
  }
}) as EventListener);

// Initialize global history patch immediately upon module load
patchHistoryStateEvents();
