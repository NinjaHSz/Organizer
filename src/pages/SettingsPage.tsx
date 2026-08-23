import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Palette,
  Bell,
  Trash2,
  CheckCircle,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useTheme, ACCENT_COLORS } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/notificationService';
import { checkForAppUpdates, forceUpdateAndClearCache } from '../services/pwaManager';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { showToast, refreshData } = useApp();

  // Notification States
  const [dailyNotif, setDailyNotif] = useState<boolean>(() => {
    const isSavedEnabled = localStorage.getItem('daily-reminders-enabled') === 'true';
    if (typeof Notification !== 'undefined') {
      return isSavedEnabled && Notification.permission === 'granted';
    }
    return false;
  });
  const [notifTime, setNotifTime] = useState<string>(() => {
    return localStorage.getItem('notif-time') || '09:00';
  });

  const handleToggleDailyNotif = async () => {
    if (!dailyNotif) {
      if (!('Notification' in window)) {
        showToast('Seu navegador não suporta notificações.', 'error');
        return;
      }

      let perm = Notification.permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
      }

      if (perm === 'granted') {
        setDailyNotif(true);
        localStorage.setItem('daily-reminders-enabled', 'true');
        showToast('Lembretes diários ativados!', 'success');
        notificationService.subscribeToPush();
      } else if (perm === 'denied') {
        setDailyNotif(false);
        localStorage.setItem('daily-reminders-enabled', 'false');
        showToast('Notificações bloqueadas nas permissões do navegador.', 'error');
      } else {
        setDailyNotif(false);
        localStorage.setItem('daily-reminders-enabled', 'false');
        showToast('Permissão de notificações não concedida.', 'warning');
      }
    } else {
      setDailyNotif(false);
      localStorage.setItem('daily-reminders-enabled', 'false');
      showToast('Lembretes diários desativados.', 'info');
    }
  };

  const handleNotifTimeChange = (time: string) => {
    setNotifTime(time);
    localStorage.setItem('notif-time', time);
    showToast(`Horário de lembrete definido para ${time}`, 'info');
  };

  const handleTestNotification = async () => {
    if (!('Notification' in window)) {
      showToast('Seu navegador não suporta notificações.', 'error');
      return;
    }

    let perm = Notification.permission;
    if (perm !== 'granted') {
      perm = await Notification.requestPermission();
    }

    if (perm === 'granted') {
      notificationService.showLocalNotification('Organizer Notificações', {
        body: 'Tudo pronto! Suas notificações de tarefas estão funcionando perfeitamente. 🎉',
      });
      showToast('Notificação de teste enviada!', 'success');
    } else {
      showToast('Permissão de notificação negada no navegador.', 'error');
    }
  };

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    showToast('Verificando se há atualizações...', 'info');
    try {
      const found = await checkForAppUpdates();
      if (found) {
        showToast('Nova versão encontrada! Atualizando...', 'success');
      } else {
        showToast('Você já está na versão mais recente!', 'success');
      }
    } catch {
      showToast('Erro ao verificar atualizações.', 'error');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleClearCache = async () => {
    localStorage.removeItem('cache_tasks');
    localStorage.removeItem('cache_subjects');
    refreshData();
    showToast('Limpando todos os caches e recarregando...', 'info');
    setTimeout(() => {
      forceUpdateAndClearCache();
    }, 500);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32 lg:pb-12 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Aparência */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
              <Moon size={15} />
              <span>Aparência</span>
            </h3>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-2xl bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-primary)]">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Modo Escuro</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {theme === 'dark' ? 'Tema escuro ativado' : 'Tema claro ativado'}
                  </p>
                </div>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`ios-toggle ${theme === 'dark' ? 'active' : ''}`}
                title="Alternar tema"
              >
                <div className="ios-toggle-dot" />
              </button>
            </div>
          </section>

          {/* Personalização / Cores de Destaque */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
              <Palette size={15} />
              <span>Cor de Destaque (Accent Color)</span>
            </h3>

            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Escolha a cor principal para botões, indicadores e destaques do app:
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {ACCENT_COLORS.map((c) => {
                const isSelected = accentColor.toLowerCase() === c.value.toLowerCase();
                return (
                  <button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    className={`h-11 rounded-2xl transition-all flex flex-col items-center justify-center relative ${
                      isSelected
                        ? 'ring-4 ring-[var(--text-primary)]/20 scale-110 shadow-lg'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {isSelected && <CheckCircle size={18} className="text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notificações PWA */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
              <Bell size={15} />
              <span>Notificações & Lembretes</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-2xl bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-primary)]">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      Lembretes Diários
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Resumo das suas tarefas no horário agendado
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={dailyNotif}
                  onClick={handleToggleDailyNotif}
                  className={`ios-toggle cursor-pointer ${dailyNotif ? 'active' : ''}`}
                  title={dailyNotif ? 'Desativar lembretes diários' : 'Ativar lembretes diários'}
                >
                  <div className="ios-toggle-dot" />
                </button>
              </div>

              {/* Time Selector */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Horário do Resumo Matinal
                </span>
                <input
                  type="time"
                  value={notifTime}
                  onChange={(e) => handleNotifTimeChange(e.target.value)}
                  className="bg-[var(--surface-subtle)] text-[var(--text-primary)] px-3 py-1.5 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-[var(--action-primary)] cursor-pointer"
                />
              </div>

              {/* Test Button */}
              <button
                onClick={handleTestNotification}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-subtle)]/80 text-[var(--text-primary)] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>Testar Notificação Agora</span>
              </button>
            </div>
          </section>

          {/* Manutenção de Cache & Atualizações */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
              <RefreshCw size={15} />
              <span>Atualizações & Cache PWA</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="py-2.5 px-4 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--action-primary)]/15 text-[var(--text-primary)] hover:text-[var(--action-primary)] text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={14} className={isCheckingUpdate ? 'animate-spin' : ''} />
                <span>{isCheckingUpdate ? 'Verificando...' : 'Buscar Atualizações'}</span>
              </button>

              <button
                onClick={handleClearCache}
                className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Limpar Todo Cache & Recarregar</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
