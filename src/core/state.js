/**
 * Global State Management
 */

export const state = {
  tasks: [],
  subjects: [],
  currentPage: "tasks",
  filters: {
    search: "",
    status: "all",
    priority: "all",
    category: "all",
    viewMode: localStorage.getItem("view-mode") || "list",
  },
  calendarDate: new Date(),
  selectedCalendarDate: new Date().toISOString().split("T")[0],
  navStyle: localStorage.getItem("nav-style") || "docked",
};

export const updateState = (key, value) => {
  if (typeof key === "object") {
    Object.assign(state, key);
  } else {
    state[key] = value;
  }
};
