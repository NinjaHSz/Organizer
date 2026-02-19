import { AppEngine } from "./core/app-engine.js";

document.addEventListener("DOMContentLoaded", () => {
  const organizer = new AppEngine();
  organizer.init();

  // Registro do Service Worker para Notificações PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ Service Worker registrado:", reg.scope))
      .catch((err) => console.error("❌ Erro ao registrar SW:", err));
  }

  // Expose it for debugging if needed
  window.organizer = organizer;
});
