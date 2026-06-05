import { inject, type App, shallowReactive } from 'vue';
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
  type RouteRecord,
  type RouteLocation
} from './history';
import { RouterLink, useLink } from './RouterLink';
import { RouterView } from './RouterView';

export {
  currentRoute,
  globalRoutes,
  routerKey,
  routeLocationKey,
  routerViewLocationKey,
  matchedRouteKey,
  viewDepthKey,
  ROUTER_KEY,
  router
};
export type { RouteRecord, RouteLocation };
export { RouterLink, RouterView, useLink };
export { isNavigationFailure, NavigationFailureType, ErrorTypes } from './errors';

export interface RouterOptions {
  history?: any;
  routes: RouteRecord[];
}

router.install = function (app: App) {
  const reactiveRoute = {} as any;
  const routeKeys = ['path', 'name', 'params', 'query', 'hash', 'fullPath', 'matched', 'meta', 'redirectedFrom'];
  for (const key of routeKeys) {
    Object.defineProperty(reactiveRoute, key, {
      get: () => currentRoute.value[key as keyof RouteLocation],
      enumerable: true,
    });
  }

  app.provide(routerKey, this);
  app.provide(routeLocationKey, shallowReactive(reactiveRoute));
  app.provide(routerViewLocationKey, currentRoute);
  app.provide(ROUTER_KEY, this);

  app.component('RouterView', RouterView);
  app.component('RouterLink', RouterLink);

  app.config.globalProperties.$router = this;
  Object.defineProperty(app.config.globalProperties, '$route', {
    enumerable: true,
    get: () => currentRoute.value
  });
};

export function createRouter(options: RouterOptions) {
  if (options.routes) {
    for (const route of options.routes) {
      const existingIdx = globalRoutes.findIndex(r => r.path === route.path);
      if (existingIdx >= 0) {
        globalRoutes[existingIdx] = route;
      } else {
        globalRoutes.push(route);
      }
    }
  }
  router.options = options;

  const initialPath = window.location.pathname + window.location.search + window.location.hash;
  updateCurrentRoute(initialPath);

  return router;
}

export function createWebHistory(base = '') {
  return {
    base,
    get location() { return window.location.pathname + window.location.search + window.location.hash; },
    get state() { return window.history.state; },
    push(to: string, _data?: any) {
      const state = _data ? { ..._data, current: to } : { current: to };
      window.history.pushState(state, '', to);
    },
    replace(to: string, _data?: any) {
      const state = _data ? { ..._data, current: to } : { current: to };
      window.history.replaceState(state, '', to);
    },
    go(delta: number) {
      window.history.go(delta);
    },
    listen(callback: any) {
      const handler = () => {
        callback(this.location, this.location, { type: 'pop', direction: '', delta: 0 } as any);
      };
      window.addEventListener('popstate', handler);
      return () => window.removeEventListener('popstate', handler);
    },
    createHref(location: string) {
      return base + location;
    },
    destroy() {}
  };
}

export function createWebHashHistory(base = '') {
  return {
    base,
    get location() { return window.location.hash.slice(1) || '/'; },
    get state() { return window.history.state; },
    push(to: string, _data?: any) {
      const state = _data ? { ..._data, current: '#' + to } : { current: '#' + to };
      window.history.pushState(state, '', '#' + to);
    },
    replace(to: string, _data?: any) {
      const state = _data ? { ..._data, current: '#' + to } : { current: '#' + to };
      window.history.replaceState(state, '', '#' + to);
    },
    go(delta: number) {
      window.history.go(delta);
    },
    listen(callback: any) {
      const handler = () => {
        callback(this.location, this.location, { type: 'pop', direction: '', delta: 0 } as any);
      };
      window.addEventListener('popstate', handler);
      return () => window.removeEventListener('popstate', handler);
    },
    createHref(location: string) {
      return '#' + location;
    },
    destroy() {}
  };
}

export function createMemoryHistory(base = '') {
  let index = 0;
  const entries = ['/'];
  return {
    base,
    get location() { return entries[index]; },
    get state() { return {}; },
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
    destroy() {}
  };
}

export function useRouter() {
  return inject(routerKey) || router;
}

const reactiveRoute = {} as any;
const routeKeys = ['path', 'name', 'params', 'query', 'hash', 'fullPath', 'matched', 'meta', 'redirectedFrom'];
for (const key of routeKeys) {
  Object.defineProperty(reactiveRoute, key, {
    get: () => currentRoute.value[key as keyof RouteLocation],
    enumerable: true,
  });
}

export function useRoute() {
  return inject(routeLocationKey) || reactiveRoute;
}
