// State Preservation for Mobile Navigation
// Preserves scroll position and form state when switching tabs

class NavigationStateManager {
  constructor() {
    this.states = new Map();
    this.currentRoute = null;
  }

  // Save current page state before navigation
  saveState(route) {
    if (!route) return;

    const state = {
      scrollPosition: document.getElementById("app-root")?.scrollTop || 0,
      timestamp: Date.now(),
      // Save any form data in progress
      formData: this.captureFormData(),
    };

    this.states.set(route, state);

    // Store in sessionStorage for persistence across reloads
    try {
      sessionStorage.setItem(`nav_state_${route}`, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save navigation state:", e);
    }
  }

  // Restore page state after navigation
  restoreState(route) {
    if (!route) return;

    // Try to get from memory first, then sessionStorage
    let state = this.states.get(route);

    if (!state) {
      try {
        const stored = sessionStorage.getItem(`nav_state_${route}`);
        if (stored) {
          state = JSON.parse(stored);
          this.states.set(route, state);
        }
      } catch (e) {
        console.warn("Failed to restore navigation state:", e);
      }
    }

    if (state) {
      // Restore scroll position (with a small delay for DOM to render)
      requestAnimationFrame(() => {
        const appRoot = document.getElementById("app-root");
        if (appRoot && state.scrollPosition) {
          appRoot.scrollTop = state.scrollPosition;
        }
      });

      // Restore form data if any
      if (state.formData) {
        this.restoreFormData(state.formData);
      }
    }
  }

  // Capture form data from current page
  captureFormData() {
    const forms = document.querySelectorAll("form");
    const formData = {};

    forms.forEach((form, index) => {
      const inputs = form.querySelectorAll("input, textarea, select");
      const data = {};

      inputs.forEach((input) => {
        if (input.id) {
          data[input.id] = input.value;
        }
      });

      if (Object.keys(data).length > 0) {
        formData[`form_${index}`] = data;
      }
    });

    return Object.keys(formData).length > 0 ? formData : null;
  }

  // Restore form data to current page
  restoreFormData(formData) {
    if (!formData) return;

    Object.entries(formData).forEach(([formKey, data]) => {
      Object.entries(data).forEach(([inputId, value]) => {
        const input = document.getElementById(inputId);
        if (input && !input.value) {
          input.value = value;
        }
      });
    });
  }

  // Clear old states (keep only last 5 routes)
  cleanup() {
    if (this.states.size > 5) {
      const entries = Array.from(this.states.entries());
      // Sort by timestamp and keep newest 5
      entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));

      this.states.clear();
      entries.slice(0, 5).forEach(([route, state]) => {
        this.states.set(route, state);
      });
    }
  }

  // Update current route
  setCurrentRoute(route) {
    if (this.currentRoute && this.currentRoute !== route) {
      this.saveState(this.currentRoute);
    }
    this.currentRoute = route;
    this.cleanup();
  }
}

// Export singleton instance
export const navStateManager = new NavigationStateManager();
