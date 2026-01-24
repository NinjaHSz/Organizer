/**
 * Utility functions for the application
 */

export const getFilteredTasks = (state) => {
  return state.tasks
    .filter((t) => {
      const matchesSearch = t.title
        .toLowerCase()
        .includes(state.filters.search.toLowerCase());

      let matchesCategory = true;
      const today = new Date().toISOString().split("T")[0];

      if (state.filters.category === "all") {
        matchesCategory = true; // Mostra todas as tarefas
      } else if (state.filters.category === "upcoming") {
        matchesCategory =
          (t.due_date >= today || !t.due_date) && t.status !== "done";
      } else if (state.filters.category === "done") {
        matchesCategory = t.status === "done";
      } else if (state.filters.category === "overdue") {
        matchesCategory =
          t.due_date && t.due_date < today && t.status !== "done";
      } else if (state.filters.category === "tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        matchesCategory = t.due_date === tomorrowStr;
      }

      const matchesPriority =
        state.filters.priority === "all" ||
        t.priority === state.filters.priority;

      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "Sem data";
  return dateStr.split("-").reverse().join("/");
};
