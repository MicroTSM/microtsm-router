import { defineComponent, h, inject, computed, reactive, unref } from 'vue';
import { routerKey, routeLocationKey, currentRoute, router as fallbackRouter } from './history';

const getLinkClass = (
  propClass: string | undefined,
  globalClass: string | undefined,
  defaultClass: string
): string =>
  propClass != null
    ? propClass
    : globalClass != null
      ? globalClass
      : defaultClass;

export function useLink(props: any) {
  const router = inject(routerKey) || fallbackRouter;
  const currentRouteLoc = inject(routeLocationKey) || currentRoute;

  const route = computed(() => {
    return router.resolve(unref(props.to));
  });

  const isActive = computed(() => {
    const linkPath = route.value.path.replace(/\/+$/, '') || '/';
    const currentPath = currentRouteLoc.path.replace(/\/+$/, '') || '/';
    if (linkPath === '/') {
      return currentPath === '/';
    }
    return currentPath === linkPath || currentPath.startsWith(linkPath + '/');
  });

  const isExactActive = computed(() => {
    const linkPath = route.value.path.replace(/\/+$/, '') || '/';
    const currentPath = currentRouteLoc.path.replace(/\/+$/, '') || '/';
    return currentPath === linkPath;
  });

  function navigate(e: MouseEvent = {} as MouseEvent) {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return Promise.resolve();
    if (e.defaultPrevented) return Promise.resolve();
    if (e.button !== undefined && e.button !== 0) return Promise.resolve();
    if (e.currentTarget && (e.currentTarget as any).getAttribute) {
      const target = (e.currentTarget as any).getAttribute('target');
      if (/\b_blank\b/i.test(target)) return Promise.resolve();
    }
    if (e.preventDefault) e.preventDefault();

    const path = route.value.fullPath;
    const method = unref(props.replace) ? 'replace' : 'push';
    return router[method](path);
  }

  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}

export const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: 'page',
    }
  },
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const router = inject(routerKey) || fallbackRouter;

    const elClass = computed(() => ({
      [getLinkClass(
        props.activeClass,
        router.options?.linkActiveClass,
        'router-link-active'
      )]: link.isActive,
      [getLinkClass(
        props.exactActiveClass,
        router.options?.linkExactActiveClass,
        'router-link-exact-active'
      )]: link.isExactActive,
    }));

    return () => {
      const children = slots.default ? slots.default(link) : [];
      const singleChild = children.length === 1 ? children[0] : children;
      return props.custom
        ? singleChild
        : h(
            'a',
            {
              'aria-current': link.isExactActive ? props.ariaCurrentValue : null,
              href: link.href,
              onClick: link.navigate,
              class: elClass.value,
            },
            children
          );
    };
  },
});
