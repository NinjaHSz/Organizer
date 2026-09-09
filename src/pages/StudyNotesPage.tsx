import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  BookOpen,
  FolderArchive,
  Send,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type MaterialCategory =
  | 'all'
  | 'drive'
  | 'redacao'
  | 'exatas'
  | 'natureza'
  | 'humanas'
  | 'cursinho'
  | 'custom';

export interface StudyMaterial {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  category: 'drive' | 'redacao' | 'exatas' | 'natureza' | 'humanas' | 'cursinho' | 'custom';
  tags: string[];
  color: string;
  icon: 'drive' | 'telegram' | 'book';
  pinned?: boolean;
}

const ALL_LINKTREE_MATERIALS: StudyMaterial[] = [
  // --- DRIVES PRINCIPAIS & RESUMOS ---
  {
    id: 'drive-resumos',
    title: 'Material de Resumos!',
    subtitle: 'Caderno de resumos ilustrados, mapas mentais e resumos esquematizados',
    url: 'https://drive.google.com/drive/folders/1razFaWiiyxsTxxQ4QdIrbq6vXY8GXrIN',
    category: 'drive',
    tags: ['Google Drive', 'Resumos', 'Mapas Mentais', 'Revisão'],
    color: '#0EA5E9',
    icon: 'drive',
    pinned: true,
  },
  {
    id: 'drive-estudos',
    title: 'Material de Estudos! 📚',
    subtitle: 'Apostilas completas de cursinhos de ponta e conteúdo teórico detalhado',
    url: 'https://drive.google.com/drive/folders/1bqiB1xvV7gl94Fh1EibtPNxhWf-taLeo',
    category: 'drive',
    tags: ['Google Drive', 'Apostilas', 'Teoria Completa', 'Livros'],
    color: '#3B82F6',
    icon: 'drive',
    pinned: true,
  },
  {
    id: 'drive-provas',
    title: 'Provas e Exercícios!',
    subtitle: 'Baterias de questões classificadas por matéria e provas anteriores do ENEM',
    url: 'https://drive.google.com/drive/folders/1eHJWY8OR_ErWjJO0EkFy9goRtPlN9vSs',
    category: 'drive',
    tags: ['Google Drive', 'Provas Anteriores', 'Exercícios', 'Gabaritos'],
    color: '#10B981',
    icon: 'drive',
    pinned: true,
  },
  {
    id: 'drive-cronograma',
    title: 'Checklist + Cronograma!',
    subtitle: 'Cronogramas organizados semana a semana e checklists de matérias prioritárias',
    url: 'https://drive.google.com/drive/folders/12gsqvBlrNhYQHQldEtCOcoWQQ_cb4CUt',
    category: 'drive',
    tags: ['Google Drive', 'Planejamento', 'Cronograma', 'Checklist'],
    color: '#8B5CF6',
    icon: 'drive',
    pinned: true,
  },
  {
    id: 'drive-edcley',
    title: 'Edcley PDFs - Acervo Extenso',
    subtitle: 'Biblioteca complementar de apostilas e PDFs preparatórios',
    url: 'https://drive.google.com/drive/folders/1BYHl4wAbK1YO5npNc45txeDLE61kfSca',
    category: 'drive',
    tags: ['Google Drive', 'PDFs', 'Biblioteca', 'Apoio'],
    color: '#6366F1',
    icon: 'drive',
  },

  // --- REDAÇÃO NOTA 1000 ---
  {
    id: 'redacao-fernanda-pessoa',
    title: 'Redação - Fernanda Pessoa',
    subtitle: 'Técnicas de estrutura dissertativa, repertório sociocultural e modelos nota 1000',
    url: 'https://t.me/rszinp',
    category: 'redacao',
    tags: ['Telegram', 'Redação 1000', 'Fernanda Pessoa', 'Estrutura'],
    color: '#EC4899',
    icon: 'telegram',
    pinned: true,
  },
  {
    id: 'curso-redacao-fp',
    title: 'Curso Redação - Fernanda Pessoa',
    subtitle: 'Aulas completas e propostas de redação com correções e análises',
    url: 'https://t.me/a66380',
    category: 'redacao',
    tags: ['Telegram', 'Curso', 'Fernanda Pessoa', 'Temas'],
    color: '#F43F5E',
    icon: 'telegram',
  },

  // --- EXATAS ---
  {
    id: 'ferreto-matematica',
    title: 'Matemática - Professor Ferreto',
    subtitle: 'Aulas teóricas e listas de matemática básica até geometria analítica',
    url: 'https://t.me/Uburey2',
    category: 'exatas',
    tags: ['Telegram', 'Matemática', 'Ferreto', 'TRI Alta'],
    color: '#F59E0B',
    icon: 'telegram',
    pinned: true,
  },
  {
    id: 'mestres-da-matematica',
    title: 'Mestres da Matemática',
    subtitle: 'Exercícios práticos de velocidade e resolução comentada de questões',
    url: 'https://t.me/oitudopooohd',
    category: 'exatas',
    tags: ['Telegram', 'Matemática', 'Exercícios', 'Dicas'],
    color: '#D97706',
    icon: 'telegram',
  },

  // --- CIÊNCIAS DA NATUREZA ---
  {
    id: 'ferreto-biologia',
    title: 'Biologia - Professor Ferreto',
    subtitle: 'Genética, ecologia, citologia e listas focadas no estilo ENEM',
    url: 'https://t.me/Uburey1',
    category: 'natureza',
    tags: ['Telegram', 'Biologia', 'Ferreto', 'Ecologia'],
    color: '#10B981',
    icon: 'telegram',
    pinned: true,
  },
  {
    id: 'ferreto-fisica',
    title: 'Física - Professor Ferreto',
    subtitle: 'Mecânica, termologia, eletricidade e ondulatória passo a passo',
    url: 'https://t.me/Uburey3',
    category: 'natureza',
    tags: ['Telegram', 'Física', 'Ferreto', 'Fórmulas'],
    color: '#0284C7',
    icon: 'telegram',
    pinned: true,
  },
  {
    id: 'ferreto-quimica',
    title: 'Ferreto | Química',
    subtitle: 'Química geral, orgânica e físico-química com resoluções',
    url: 'https://t.me/analeeo',
    category: 'natureza',
    tags: ['Telegram', 'Química', 'Ferreto', 'Orgânica'],
    color: '#0D9488',
    icon: 'telegram',
  },
  {
    id: 'iquimica',
    title: 'IQuímica Especializada',
    subtitle: 'Listas aprofundadas de estequiometria, equilíbrio químico e macetes',
    url: 'https://t.me/iquimicaa',
    category: 'natureza',
    tags: ['Telegram', 'Química', 'Macetes', 'Exercícios'],
    color: '#059669',
    icon: 'telegram',
  },

  // --- CIÊNCIAS HUMANAS ---
  {
    id: 'humanas-geral',
    title: 'Humanas Completo',
    subtitle: 'Canal dedicado a História do Brasil, História Geral e Geografia Crítica',
    url: 'https://t.me/fczio',
    category: 'humanas',
    tags: ['Telegram', 'História', 'Geografia', 'Humanas'],
    color: '#B45309',
    icon: 'telegram',
  },
  {
    id: 'aprova-sociologia',
    title: 'Aprova - Sociologia',
    subtitle: 'Sociólogos clássicos, cidadania, movimentos sociais e repertório',
    url: 'https://t.me/aprovasociologia',
    category: 'humanas',
    tags: ['Telegram', 'Sociologia', 'Repertório', 'Filosofia'],
    color: '#EA580C',
    icon: 'telegram',
  },
  {
    id: 'ferreto-filosofia',
    title: 'Ferreto | Filosofia',
    subtitle: 'Filosofia antiga, medieval, moderna e ética para a prova de humanas',
    url: 'https://t.me/+dn8it6wWEeQ1YzQx',
    category: 'humanas',
    tags: ['Telegram', 'Filosofia', 'Ferreto', 'Ética'],
    color: '#7C3AED',
    icon: 'telegram',
  },

  // --- CURSINHOS & PLATAFORMAS DE ELITE ---
  {
    id: 'cursinho-hexagono',
    title: 'Cursinho Hexágono!',
    subtitle: 'Aprofundamento de alto rendimento focado em Medicina e vestibulares difíceis',
    url: 'https://t.me/+cYF7_uzEd2JjZjAx',
    category: 'cursinho',
    tags: ['Telegram', 'Cursinho', 'Hexágono', 'Medicina'],
    color: '#DB2777',
    icon: 'telegram',
    pinned: true,
  },
  {
    id: 'mestres-do-enem',
    title: 'Mestres do ENEM!',
    subtitle: 'Comunidade com dicas diárias de cronograma, dúvidas e apoio aos vestibulandos',
    url: 'https://t.me/+dJVEmr9jo7MyMDAx',
    category: 'cursinho',
    tags: ['Telegram', 'Comunidade', 'Dicas Gerais', 'Simulados'],
    color: '#F59E0B',
    icon: 'telegram',
  },
  {
    id: 'aprova-total-enem',
    title: 'Aprova Total - ENEM',
    subtitle: 'Materiais da plataforma Aprova Total, simulados TRI e cronogramas intensivos',
    url: 'https://t.me/+Ca89OLhfEvJkYmIx',
    category: 'cursinho',
    tags: ['Telegram', 'Aprova Total', 'Simulados TRI', 'Intensivo'],
    color: '#2563EB',
    icon: 'telegram',
  },
  {
    id: 'estrategia-vestibulares',
    title: 'Estratégia Vestibulares!',
    subtitle: 'Livros digitais interativos (LDI), pacotes de questões e aulões de revisão',
    url: 'https://t.me/+zNUXjkK14xAyOGIx',
    category: 'cursinho',
    tags: ['Telegram', 'Estratégia', 'LDI', 'Revisão'],
    color: '#0891B2',
    icon: 'telegram',
  },
  {
    id: 'pvo-plataforma',
    title: 'PVO - Vinícius Oliveira 2024',
    subtitle: 'Método estratégico de redação e aprovação em medicina pelo ENEM',
    url: 'https://t.me/+PNBLl5aY0KA3MGQx',
    category: 'cursinho',
    tags: ['Telegram', 'PVO', 'Vinícius Oliveira', 'Método'],
    color: '#7C3AED',
    icon: 'telegram',
  },
  {
    id: 'comunidade-pedro-assaad',
    title: 'Comunidade Pedro Assaad',
    subtitle: 'Estratégia de prova, mentalidade de alta performance e cronograma',
    url: 'https://t.me/+vDFHhIptLqo5MGIx',
    category: 'cursinho',
    tags: ['Telegram', 'Assaad', 'Alta Performance', 'Estratégia'],
    color: '#4F46E5',
    icon: 'telegram',
  },
  {
    id: 'hackeando-enem-assaad',
    title: 'Hackeando o ENEM | Assaad',
    subtitle: 'Métodos para maximizar a nota na TRI e técnicas práticas de resolução',
    url: 'https://t.me/+dmFyzRap5_U5ZTMy',
    category: 'cursinho',
    tags: ['Telegram', 'Hackeando ENEM', 'TRI', 'Táticas'],
    color: '#059669',
    icon: 'telegram',
  },
];

export const StudyNotesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = [
    { key: 'all' as MaterialCategory, label: 'Todos os Materiais', count: ALL_LINKTREE_MATERIALS.length },
    { key: 'drive' as MaterialCategory, label: 'Pastas Drive', count: ALL_LINKTREE_MATERIALS.filter(m => m.category === 'drive').length },
    { key: 'redacao' as MaterialCategory, label: 'Redação 1000', count: ALL_LINKTREE_MATERIALS.filter(m => m.category === 'redacao').length },
    { key: 'natureza' as MaterialCategory, label: 'Ciências da Natureza', count: ALL_LINKTREE_MATERIALS.filter(m => m.category === 'natureza').length },
    { key: 'exatas' as MaterialCategory, label: 'Matemática', count: ALL_LINKTREE_MATERIALS.filter(m => m.category === 'exatas').length },
    { key: 'humanas' as MaterialCategory, label: 'Humanas & Filosofia', count: ALL_LINKTREE_MATERIALS.filter(m => m.category === 'humanas').length },
    { key: 'cursinho' as MaterialCategory, label: 'Cursinhos & Táticas', count: ALL_LINKTREE_MATERIALS.filter(m => m.category === 'cursinho').length },
  ];

  const filteredMaterials = useMemo(() => {
    return ALL_LINKTREE_MATERIALS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCopy = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-5 pb-32 lg:pb-12 space-y-4">
      {/* Categorias & Busca */}
      <div className="space-y-3">
        {/* Categorias em Pílulas */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border-0 ${
                activeCategory === tab.key
                  ? 'bg-[var(--action-primary)] text-white shadow-xs'
                  : 'bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeCategory === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por disciplina, professor, cursinho ou assunto (ex: Ferreto, Redação, Drive...)"
            className="w-full bg-[var(--surface-card)] text-[var(--text-primary)] pl-10 pr-4 py-2.5 rounded-xl text-xs border-0 outline-none focus:ring-1 focus:ring-[var(--action-primary)] transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Lista de Materiais no padrão dos Cards de Tarefas */}
      <div className="space-y-2.5">
        {filteredMaterials.map((link) => {
          const isExpanded = !!expandedCardIds[link.id];

          const categoryLabel =
            link.category === 'drive'
              ? 'Google Drive'
              : link.category === 'redacao'
              ? 'Redação'
              : link.category === 'exatas'
              ? 'Matemática'
              : link.category === 'natureza'
              ? 'Ciências da Natureza'
              : link.category === 'humanas'
              ? 'Ciências Humanas'
              : 'Cursinho';

          return (
            <div
              key={link.id}
              className="group relative bg-[var(--surface-card)] rounded-xl transition-all duration-200 overflow-hidden shadow-xs hover:shadow-card border border-transparent hover:border-[var(--action-primary)]/20"
            >
              {/* Indicador de borda vertical (estilo prioridade do TaskCard) */}
              <div
                className="absolute left-[2px] top-2 bottom-2 w-1 rounded-full transition-colors duration-200"
                style={{ backgroundColor: link.color }}
              />

              <div className="py-3.5 px-3.5 sm:px-4 pl-4 sm:pl-4.5">
                {/* Main Row */}
                <div className="flex items-center gap-3">
                  {/* Ícone Redondo (mesmo tamanho e alinhamento do checkbox de tarefas) */}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="size-10 sm:size-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-2xs active:scale-90 cursor-pointer outline-none"
                    style={{
                      backgroundColor: `${link.color}18`,
                      color: link.color,
                    }}
                    title="Acessar material"
                  >
                    {link.icon === 'drive' ? (
                      <FolderArchive size={20} className="stroke-[2.5]" />
                    ) : link.icon === 'telegram' ? (
                      <Send size={19} className="stroke-[2.5]" />
                    ) : (
                      <BookOpen size={20} className="stroke-[2.5]" />
                    )}
                  </a>

                  {/* Título e Sub-row Clicável para Expansão/Compactação */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleExpand(link.id)}
                  >
                    {/* Título */}
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug ${
                          isExpanded ? 'break-words' : 'truncate'
                        }`}
                      >
                        {link.title}
                      </h4>
                    </div>

                    {/* Sub-row: Categoria (com dot colorido) + Tags prévias */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                      {/* Badge da Categoria com dot colorido */}
                      <span
                        className="font-bold flex items-center gap-1.5 shrink-0 uppercase tracking-wider text-[11px]"
                        style={{ color: link.color }}
                      >
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: link.color }}
                        />
                        <span>{categoryLabel}</span>
                      </span>

                      {/* Subtítulo resumido quando compactado */}
                      {!isExpanded && (
                        <span className="text-[var(--text-muted)] truncate max-w-md hidden sm:inline">
                          {link.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações Direitas (Abrir link, Copiar, Expandir) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, link.id, link.url)}
                      className="size-10 sm:size-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--action-primary)] hover:bg-[var(--surface-subtle)] transition-all duration-200 shrink-0 active:scale-90 cursor-pointer outline-none"
                      title="Copiar Link"
                    >
                      {copiedId === link.id ? (
                        <Check size={18} className="text-emerald-500 stroke-[2.5]" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-10 sm:size-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--action-primary)] hover:bg-[var(--surface-subtle)] transition-all duration-200 shrink-0 active:scale-90 cursor-pointer outline-none"
                      title="Abrir Material Externo"
                    >
                      <ExternalLink size={18} />
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleExpand(link.id)}
                      className="size-9 sm:size-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-all duration-200 shrink-0 active:scale-90 cursor-pointer outline-none"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                    >
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Seção Expansível de Detalhes (idêntica ao TaskCard) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[var(--surface-subtle)] animate-fade-in space-y-2.5 pl-2 sm:pl-9">
                    {/* Descrição Completa */}
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                      {link.subtitle}
                    </p>

                    {/* Tags e URL */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {link.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] text-[var(--text-secondary)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Botão de Acesso Direto Estilizado */}
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all"
                      >
                        <span>Acessar {categoryLabel}</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 bg-[var(--surface-card)] rounded-xl border border-[var(--border-subtle)]">
          <BookOpen size={36} className="mx-auto text-[var(--text-muted)] mb-2" />
          <p className="text-sm font-bold text-[var(--text-secondary)]">Nenhum material encontrado</p>
          <p className="text-xs text-[var(--text-muted)]">Tente buscar por outro termo ou mude a categoria acima.</p>
        </div>
      )}
    </div>
  );
};
