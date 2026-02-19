import { AppEngine } from "./core/app-engine.js";

document.addEventListener("DOMContentLoaded", () => {
  const organizer = new AppEngine();
  organizer.init();

  // Registro do Service Worker para Notificações PWA
  if ("serviceWorker" in navigator) {
    // 🧹 Limpeza definitiva da chave do localStorage (Migração para chave fixa no código)
    localStorage.removeItem("openrouter_api_key");

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ Service Worker registrado:", reg.scope))
      .catch((err) => console.error("❌ Erro ao registrar SW:", err));
  }

  // Expose it for debugging if needed
  window.organizer = organizer;
});
