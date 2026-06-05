import { shallowRef, type InjectionKey } from "vue";
import { matchRoute } from "./matcher";

export interface RouteRecord {
  path: string;
  name?: string | null;
  component?: any;
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

export let globalRoutes: RouteRecord[] = [];

export const currentRoute = shallowRef<RouteLocation>({
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
});

export const routerKey = Symbol("router") as InjectionKey<any>;
export const routeLocationKey = Symbol("route location") as InjectionKey<any>;
export const routerViewLocationKey = Symbol(
  "router view location",
) as InjectionKey<any>;
export const matchedRouteKey = Symbol(
  "router view location matched",
) as InjectionKey<any>;
export const viewDepthKey = Symbol("router view depth") as InjectionKey<any>;
export const ROUTER_KEY = Symbol("microtsm-router") as InjectionKey<any>;

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
    window.history.replaceState({ current: fullPath, ...(window.history.state || {}) }, "", fullPath);
  }

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
  window.dispatchEvent(new CustomEvent("microtsm:router-change", { detail: { path: matchedPath + search + hash } }));
}

export const router = {
  currentRoute,
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
      path = to.path || "";
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
    currentRoute.value = resolved;
    window.dispatchEvent(new CustomEvent("microtsm:router-change", { detail: { path: resolved.fullPath } }));
  },

  async replace(to: any): Promise<void> {
    const resolved = this.resolve(to);
    window.history.replaceState(
      { current: resolved.fullPath },
      "",
      resolved.fullPath,
    );
    currentRoute.value = resolved;
    window.dispatchEvent(new CustomEvent("microtsm:router-change", { detail: { path: resolved.fullPath } }));
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

  beforeEach(_guard: any) {
    return () => {};
  },
  beforeResolve(_guard: any) {
    return () => {};
  },
  afterEach(_guard: any) {
    return () => {};
  },
  onError(_handler: any) {
    return () => {};
  },
  isReady() {
    return Promise.resolve();
  },

  install: null as any,
};

window.addEventListener("popstate", () => {
  const fullPath =
    window.location.pathname + window.location.search + window.location.hash;
  updateCurrentRoute(fullPath);
});
