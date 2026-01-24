import { AppEngine } from "./core/app-engine.js";

document.addEventListener("DOMContentLoaded", () => {
  const organizer = new AppEngine();
  organizer.init();

  // Expose it for debugging if needed
  window.organizer = organizer;
});
