import React, { useState } from 'react';
import { Search, RefreshCw, X, FolderPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    activePage,
    setActivePage,
    filters,
    setSearch,
    openNewSubjectModal,
    refreshData,
    isLoading,
  } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getPageInfo = () => {
    switch (activePage) {
      case 'dashboard':
        return {
          title: 'Minhas Tarefas',
          subtitle: 'Acompanhe e organize suas atividades',
        };
      case 'calendar':
        return {
          title: 'Minha Agenda',
          subtitle: 'Visão mensal e compromissos do dia',
        };
      case 'schedule':
        return {
          title: 'Cronograma de Aulas',
          subtitle: 'Horários semanais e aula ao vivo',
        };
      case 'subjects':
        return {
          title: 'Minhas Matérias',
          subtitle: 'Gerencie suas disciplinas escolares',
        };
      case 'study-notes':
        return {
          title: 'Materiais ENEM',
          subtitle: 'Acervo e links de estudo organizados',
        };
      case 'settings':
        return {
          title: 'Ajustes & Configurações',
          subtitle: 'Preferências de tema, cores e notificações',
        };
      default:
        return { title: 'Organizer', subtitle: '' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-30 bg-[var(--surface-page)]/85 ios-blur px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Title or Mobile Search Input */}
        {!isSearchOpen ? (
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {pageInfo.title}
              </h1>
              {pageInfo.subtitle && (
                <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block">
                  {pageInfo.subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 animate-fade-in md:hidden">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                autoFocus
                value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tarefas..."
                className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] pl-9 pr-4 py-2 rounded-xl text-sm outline-none border border-transparent focus:border-[var(--action-primary)] transition-all"
              />
            </div>
            <button
              onClick={() => {
                setSearch('');
                setIsSearchOpen(false);
              }}
              className="p-2 text-[var(--text-secondary)] rounded-lg hover:bg-[var(--surface-subtle)]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Desktop Search (Only for Dashboard & Calendar) */}
        {(activePage === 'dashboard' || activePage === 'calendar') && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="w-full relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título ou descrição..."
                className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] pl-10 pr-9 py-2 rounded-2xl text-xs font-medium outline-none border border-transparent focus:border-[var(--action-primary)] focus:bg-[var(--surface-card)] transition-all shadow-inner"
              />
              {filters.search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Study Notes SVG Icon Button */}
          <button
            onClick={() => setActivePage(activePage === 'study-notes' ? 'dashboard' : 'study-notes')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer relative ${
              activePage === 'study-notes'
                ? 'bg-[var(--action-primary)] text-white shadow-md shadow-[var(--action-primary)]/25 scale-105'
                : 'text-[var(--text-secondary)] hover:text-[var(--action-primary)] hover:bg-[var(--surface-subtle)] active:scale-95'
            }`}
            title="Anotações & Materiais de Estudo"
            aria-label="Anotações e Materiais de Estudo"
          >
            {/* Símbolo SVG de Notas */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
              <line x1="8" y1="9" x2="10" y2="9" />
            </svg>
            {activePage === 'study-notes' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>

          {/* Mobile Search Toggle */}
          {(activePage === 'dashboard' || activePage === 'calendar') && !isSearchOpen && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
              title="Buscar"
            >
              <Search size={20} />
            </button>
          )}

          {/* Sync / Refresh Button */}
          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className={`p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--action-primary)] hover:bg-[var(--surface-subtle)] transition-colors ${
              isLoading ? 'animate-spin text-[var(--action-primary)]' : ''
            }`}
            title="Sincronizar com Banco de Dados"
          >
            <RefreshCw size={18} />
          </button>

          {/* Contextual Actions based on Active Page */}
          {activePage === 'subjects' && (
            <button
              onClick={openNewSubjectModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow-md shadow-[var(--action-primary)]/20 hover:opacity-95 active:scale-95 transition-all"
            >
              <FolderPlus size={16} />
              <span>Nova Matéria</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
