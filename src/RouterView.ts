import {
  defineComponent,
  h,
  inject,
  provide,
  computed,
  defineAsyncComponent,
} from "vue";
import {
  routeLocationKey,
  viewDepthKey,
  matchedRouteKey,
  routerViewLocationKey,
} from "./history";

export const RouterView = defineComponent({
  name: "RouterView",
  props: {
    name: {
      type: String,
      default: "default",
    },
    route: Object,
  },
  setup(props, { slots, attrs }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(
      () => props.route || injectedRoute?.value || inject(routeLocationKey),
    );

    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      return typeof injectedDepth === "object" &&
        injectedDepth !== null &&
        "value" in injectedDepth
        ? (injectedDepth as any).value
        : injectedDepth;
    });

    const matchedRoute = computed(() => {
      const route = routeToDisplay.value;
      return route && route.matched ? route.matched[depth.value] : undefined;
    });

    provide(
      viewDepthKey,
      computed(() => depth.value + 1),
    );
    provide(matchedRouteKey, matchedRoute);
    provide(routerViewLocationKey, routeToDisplay);

    return () => {
      const route = routeToDisplay.value;
      const matched = matchedRoute.value;
      let ViewComponent = matched ? matched.component : undefined;

      if (!ViewComponent) {
        return slots.default ? slots.default({ Component: null, route }) : null;
      }

      if (typeof ViewComponent === "function") {
        ViewComponent = defineAsyncComponent(ViewComponent);
      }

      const component = h(ViewComponent, Object.assign({}, attrs));

      return slots.default
        ? slots.default({ Component: component, route })
        : component;
    };
  },
});
