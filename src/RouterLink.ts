import { router, currentRoute } from "./history";

// ─── RouterLink Web Component ─────────────────────────────────────────

class RouterLinkElement extends HTMLElement {
  private _unsubscribe?: () => void;

  static get observedAttributes() {
    return ["to", "replace"];
  }

  connectedCallback() {
    this._render();
    this._unsubscribe = currentRoute.subscribe(() =>
      this._updateActiveState()
    );
    this._updateActiveState();
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }

  attributeChangedCallback() {
    this._updateActiveState();
  }

  private _render() {
    // If no <a> child exists, wrap content in one
    if (!this.querySelector("a")) {
      const anchor = document.createElement("a");
      anchor.href = this.getAttribute("to") || "";
      // Move existing children into the anchor
      while (this.firstChild) anchor.appendChild(this.firstChild);
      this.appendChild(anchor);
    }

    this.addEventListener("click", (e) => {
      const target = this.getAttribute("to");
      if (!target) return;

      // Don't intercept modified clicks (Ctrl+click, etc.)
      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();

      const method = this.hasAttribute("replace") ? "replace" : "push";
      router[method](target);
    });
  }

  private _updateActiveState() {
    const to = this.getAttribute("to");
    if (!to) return;

    const resolved = router.resolve(to);
    const currentPath =
      currentRoute.value.path.replace(/\/+$/, "") || "/";
    const linkPath = resolved.path.replace(/\/+$/, "") || "/";

    const isExact = currentPath === linkPath;
    const isActive =
      linkPath === "/"
        ? currentPath === "/"
        : currentPath === linkPath ||
          currentPath.startsWith(linkPath + "/");

    this.classList.toggle("router-link-active", isActive);
    this.classList.toggle("router-link-exact-active", isExact);

    const anchor = this.querySelector("a");
    if (anchor) {
      anchor.setAttribute("href", resolved.fullPath || to);
      if (isExact) {
        anchor.setAttribute("aria-current", "page");
      } else {
        anchor.removeAttribute("aria-current");
      }
    }
  }
}

// Register the custom element
if (!customElements.get("router-link")) {
  customElements.define("router-link", RouterLinkElement);
}

// ─── useLink (pure TS utility) ────────────────────────────────────────

export function useLink(props: { to: string; replace?: boolean }) {
  const resolved = router.resolve(props.to);
  const currentPath =
    currentRoute.value.path.replace(/\/+$/, "") || "/";
  const linkPath = resolved.path.replace(/\/+$/, "") || "/";

  const isExact = currentPath === linkPath;
  const isActive =
    linkPath === "/"
      ? currentPath === "/"
      : currentPath === linkPath ||
        currentPath.startsWith(linkPath + "/");

  return {
    route: resolved,
    href: resolved.fullPath,
    isActive,
    isExactActive: isExact,
    navigate: (e?: MouseEvent) => {
      if (e?.metaKey || e?.altKey || e?.ctrlKey || e?.shiftKey) return;
      e?.preventDefault();
      const method = props.replace ? "replace" : "push";
      return router[method](props.to);
    },
  };
}

export { RouterLinkElement as RouterLink };
