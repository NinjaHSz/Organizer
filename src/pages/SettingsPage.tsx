import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Palette,
  Bell,
  Database,
  Trash2,
  CheckCircle,
  Save,
  Info,
  Send,
} from 'lucide-react';
import { useTheme, ACCENT_COLORS } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/notificationService';
import { resetSupabaseClient } from '../services/supabase';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { showToast, refreshData } = useApp();

  // Notification States
  const [dailyNotif, setDailyNotif] = useState<boolean>(() => {
    return localStorage.getItem('daily-reminders-enabled') !== 'false';
  });
  const [notifTime, setNotifTime] = useState<string>(() => {
    return localStorage.getItem('notif-time') || '09:00';
  });

  // Supabase Custom Config
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => {
    return (
      localStorage.getItem('supabase_url') ||
      'https://sywueeqbijwdjjleyzbo.supabase.co'
    );
  });
  const [supabaseKey, setSupabaseKey] = useState<string>(() => {
    return (
      localStorage.getItem('supabase_key') ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5d3VlZXFiaWp3ZGpqbGV5emJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTYwMTksImV4cCI6MjA4NDIzMjAxOX0.LtUDmZ5MIxTAuf8L9TZFvYKo8HY6TngiJyVRouln85Q'
    );
  });

  const handleToggleDailyNotif = async () => {
    const nextVal = !dailyNotif;
    setDailyNotif(nextVal);
    localStorage.setItem('daily-reminders-enabled', String(nextVal));

    if (nextVal) {
      const perm = await notificationService.requestPermission();
      if (perm === 'granted') {
        showToast('Notificações diárias ativadas!', 'success');
      } else {
        showToast('Permissão de notificações não concedida no navegador', 'warning');
      }
    } else {
      showToast('Notificações diárias desativadas', 'info');
    }
  };

  const handleNotifTimeChange = (time: string) => {
    setNotifTime(time);
    localStorage.setItem('notif-time', time);
    showToast(`Horário de lembrete definido para ${time}`, 'info');
  };

  const handleTestNotification = () => {
    if (Notification.permission !== 'granted') {
      notificationService.requestPermission().then((perm) => {
        if (perm === 'granted') {
          notificationService.showLocalNotification('Organizer Notificações', {
            body: 'Tudo pronto! Suas notificações de tarefas estão funcionando.',
          });
          showToast('Notificação enviada!', 'success');
        } else {
          showToast('Permissão de notificação negada', 'error');
        }
      });
    } else {
      notificationService.showLocalNotification('Organizer Notificações', {
        body: 'Tudo pronto! Suas notificações de tarefas estão funcionando.',
      });
      showToast('Notificação de teste enviada!', 'success');
    }
  };

  const handleSaveSupabaseConfig = () => {
    localStorage.setItem('supabase_url', supabaseUrl.trim());
    localStorage.setItem('supabase_key', supabaseKey.trim());
    resetSupabaseClient();
    refreshData();
    showToast('Credenciais do Supabase salvas e reconectadas!', 'success');
  };

  const handleClearCache = () => {
    localStorage.removeItem('cache_tasks');
    localStorage.removeItem('cache_subjects');
    refreshData();
    showToast('Cache offline limpo com sucesso!', 'info');
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32 lg:pb-12 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Aparência */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 border border-[var(--border-subtle)] shadow-xs">
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
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 border border-[var(--border-subtle)] shadow-xs">
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

          {/* Notificações PWA */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 border border-[var(--border-subtle)] shadow-xs">
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
                  onClick={handleToggleDailyNotif}
                  className={`ios-toggle ${dailyNotif ? 'active' : ''}`}
                >
                  <div className="ios-toggle-dot" />
                </button>
              </div>

              {/* Time Selector */}
              <div className="pt-2 border-t border-[var(--separator)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Horário do Resumo Matinal
                </span>
                <input
                  type="time"
                  value={notifTime}
                  onChange={(e) => handleNotifTimeChange(e.target.value)}
                  className="bg-[var(--surface-subtle)] text-[var(--text-primary)] px-3 py-1.5 rounded-xl text-xs font-bold outline-none border border-[var(--border-subtle)] cursor-pointer"
                />
              </div>

              {/* Test Button */}
              <button
                onClick={handleTestNotification}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-subtle)]/80 text-[var(--text-primary)] text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[var(--border-subtle)]"
              >
                <Send size={14} />
                <span>Testar Notificação Agora</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Conexão com Banco de Dados Supabase */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 border border-[var(--border-subtle)] shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
              <Database size={15} />
              <span>Banco de Dados & Supabase</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] px-3.5 py-2.5 rounded-xl text-xs font-mono outline-none border border-transparent focus:border-[var(--action-primary)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Supabase Anon Key
                </label>
                <textarea
                  rows={2}
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] px-3.5 py-2 rounded-xl text-[11px] font-mono outline-none border border-transparent focus:border-[var(--action-primary)] transition-all resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveSupabaseConfig}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  <span>Salvar & Reconectar</span>
                </button>
              </div>
            </div>
          </section>

          {/* Manutenção de Cache & Dados Locais */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 border border-[var(--border-subtle)] shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
              <Trash2 size={15} />
              <span>Armazenamento & Cache Offline</span>
            </h3>

            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              O Organizer mantém uma cópia das tarefas e matérias em cache local para permitir o uso contínuo mesmo sem conexão de internet.
            </p>

            <button
              onClick={handleClearCache}
              className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-colors flex items-center gap-2 border border-rose-500/20"
            >
              <Trash2 size={14} />
              <span>Limpar Cache Offline</span>
            </button>
          </section>

          {/* Informações da Aplicação */}
          <section className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-6 border border-[var(--border-subtle)] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-[var(--action-primary)]/10 text-[var(--action-primary)] flex items-center justify-center">
                <Info size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Organizer 2.0 (React)</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Construído com React 19, TypeScript, Tailwind CSS, Gemini 2.0 & Supabase.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
