import {
  currentRoute,
  type RouteRecord,
  type MountableComponent,
} from "./history";

// ─── RouterView Web Component ─────────────────────────────────────────

class RouterViewElement extends HTMLElement {
  private _unsubscribe?: () => void;
  private _currentComponent?: MountableComponent;
  private _depth: number = 0;

  connectedCallback() {
    // Calculate depth by counting ancestor <router-view> elements
    this._depth = this._calculateDepth();

    // Subscribe to route changes
    this._unsubscribe = currentRoute.subscribe((newRoute) => {
      this._renderMatchedComponent(newRoute.matched);
    });

    // Initial render
    this._renderMatchedComponent(currentRoute.value.matched);
  }

  disconnectedCallback() {
    this._unmountCurrent();
    this._unsubscribe?.();
  }

  private _calculateDepth(): number {
    let depth = 0;
    let parent = this.parentElement;
    while (parent) {
      if (parent.tagName === "ROUTER-VIEW") depth++;
      parent = parent.parentElement;
    }
    return depth;
  }

  private async _renderMatchedComponent(matched: RouteRecord[]) {
    const matchedRoute = matched[this._depth];
    const newComponent = matchedRoute?.component;

    // Same component — skip
    if (newComponent === this._currentComponent) return;

    // Unmount old
    this._unmountCurrent();

    // Mount new
    if (newComponent?.mount) {
      this._currentComponent = newComponent;
      await newComponent.mount(this);
    }
  }

  private _unmountCurrent() {
    if (this._currentComponent?.unmount) {
      this._currentComponent.unmount(this);
      this._currentComponent = undefined;
    }
  }
}

// Register the custom element
if (!customElements.get("router-view")) {
  customElements.define("router-view", RouterViewElement);
}

export { RouterViewElement as RouterView };
