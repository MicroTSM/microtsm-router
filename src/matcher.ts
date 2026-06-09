import type { RouteRecord } from "./history";

function resolvePath(parentPath: string, childPath: string): string {
  if (childPath.startsWith("/")) return childPath;
  const base = parentPath.endsWith("/") ? parentPath : `${parentPath}/`;
  return `${base}${childPath}`.replace(/\/+/g, "/");
}

function matchPathPattern(
  routePath: string,
  actualPath: string,
): Record<string, string> | null {
  const rPath = routePath.replace(/\/+$/, "") || "/";
  const aPath = actualPath.replace(/\/+$/, "") || "/";

  if (rPath === aPath) {
    return {};
  }

  const rSegs = rPath.split("/");
  const aSegs = aPath.split("/");

  if (rSegs.length !== aSegs.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < rSegs.length; i++) {
    const rSeg = rSegs[i];
    const aSeg = aSegs[i];
    if (rSeg.startsWith(":")) {
      params[rSeg.slice(1)] = decodeURIComponent(aSeg);
    } else if (rSeg !== aSeg) {
      return null;
    }
  }
  return params;
}

export function findFullPathByName(
  routes: RouteRecord[],
  name: string,
  parentPath = "",
): string | null {
  for (const route of routes) {
    const fullPath = resolvePath(parentPath, route.path);
    if (route.name === name) return fullPath;
    if (route.children) {
      const childFullPath = findFullPathByName(route.children, name, fullPath);
      if (childFullPath) return childFullPath;
    }
  }
  return null;
}

export interface MatchResult {
  route: RouteRecord;
  matched: RouteRecord[];
  params: Record<string, string>;
  path: string;
}

export function matchRoute(
  routes: RouteRecord[],
  currentPath: string,
  parentPath = "",
  ancestors: RouteRecord[] = [],
  depth = 0,
  rootRoutes = routes,
): MatchResult | null {
  if (depth > 10) return null;
  for (const route of routes) {
    const fullPath = resolvePath(parentPath, route.path);
    const params = matchPathPattern(fullPath, currentPath);

    if (params !== null) {
      if (route.redirect) {
        const redirectVal =
          typeof route.redirect === "function"
            ? route.redirect({ path: currentPath, params, query: {}, hash: "" })
            : route.redirect;

        let redirectTarget = "";
        if (typeof redirectVal === "string") {
          redirectTarget = redirectVal;
        } else if (redirectVal && typeof redirectVal === "object") {
          if (redirectVal.name) {
            const resolvedPath = findFullPathByName(
              rootRoutes,
              redirectVal.name,
            );
            if (resolvedPath) redirectTarget = resolvedPath;
          } else {
            redirectTarget = redirectVal.path || "";
          }
        }

        if (redirectTarget) {
          const resolvedTarget = redirectTarget.startsWith("/")
            ? redirectTarget
            : resolvePath(fullPath, redirectTarget);
          return matchRoute(
            rootRoutes,
            resolvedTarget,
            "",
            [],
            depth + 1,
            rootRoutes,
          );
        }
      }
      return {
        route,
        matched: [...ancestors, route],
        params,
        path: currentPath,
      };
    }

    if (route.children && route.children.length > 0) {
      const childMatch = matchRoute(
        route.children,
        currentPath,
        fullPath,
        [...ancestors, route],
        depth + 1,
        rootRoutes,
      );
      if (childMatch) return childMatch;
    }
  }
  return null;
}
