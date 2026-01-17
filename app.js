/**
 * ORGANIZER - Mobile First Application
 */

const App = {
    state: {
        tasks: [],
        subjects: [],
        currentPage: 'tasks',
        filters: {
            search: '',
            status: 'all',
            priority: 'all',
            category: 'upcoming', // This matches the chips
            viewMode: 'list' // 'list' or 'kanban'
        }
    },

    async init() {
        this.initTheme();
        this.bindGlobalEvents();
        await this.loadInitialData();
        this.router();
    },

    bindGlobalEvents() {
        window.addEventListener('hashchange', () => this.router());
        
        // Navigation Buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                const target = btn.dataset.nav;
                window.location.hash = target;
            };
        });

        // Global FAB
        document.getElementById('global-add-btn').onclick = () => this.showTaskForm();

        // Theme Toggle
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.onclick = () => this.toggleTheme();
        }
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.className = savedTheme;
        this.updateThemeIcon(savedTheme);
    },

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        const nextTheme = isDark ? 'light' : 'dark';
        document.documentElement.className = nextTheme;
        localStorage.setItem('theme', nextTheme);
        this.updateThemeIcon(nextTheme);
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.innerText = theme === 'dark' ? 'dark_mode' : 'light_mode';
        }
    },

    async loadInitialData() {
        try {
            if (window.supabaseClient) {
                this.state.subjects = await db.getSubjects();
                this.state.tasks = await db.getTasks();
            }
        } catch (error) {
            UI.notify('Erro ao carregar dados', 'error');
        }
    },

    loadDemoData() {
        this.state.subjects = [];
        this.state.tasks = [];
    },

    router() {
        const hash = window.location.hash || '#tasks';
        const page = hash.replace('#', '');
        this.state.currentPage = page;
        
        // Update Page Title (PC)
        const titles = {
            'tasks': 'Dashboard de Tarefas',
            'subjects-view': 'Visão por Matérias',
            'subjects-config': 'Gerenciar Categorias',
            'calendar': 'Calendário'
        };
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.innerText = titles[page] || 'Organizer';

        // Update Nav UI (Both Sidebar and Bottom Nav)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const btnPage = btn.dataset.nav;
            const icon = btn.querySelector('.material-symbols-outlined');
            const label = btn.querySelector('span:not(.material-symbols-outlined)');
            const wrapper = btn.querySelector('.icon-wrapper');

            const isActive = btnPage === page;
            
            if (isActive) {
                btn.classList.add('text-primary'); // Sidebar
                if (icon) icon.classList.add('active-tab', 'filled');
                if (label) label.classList.add('active-tab');
            } else {
                btn.classList.remove('text-primary'); // Sidebar
                if (icon) icon.classList.remove('active-tab', 'filled');
                if (label) label.classList.remove('active-tab');
            }
        });

        this.render(true);
    },

    render(animate = false) {
        const root = document.getElementById('app-root');
        
        if (animate) {
            root.classList.remove('animate_page');
            void root.offsetWidth; // Trigger reflow
            root.classList.add('animate_page');
        }
        
        switch (this.state.currentPage) {
            case 'tasks': this.renderTasksPage(root); break;
            case 'subjects-view': this.renderBySubjectPage(root); break;
            case 'subjects-config': this.renderSubjectsConfigPage(root); break;
            case 'calendar': this.renderCalendarPage(root); break;
            default: this.renderTasksPage(root);
        }
    },

    renderTasksPage(root) {
        const filteredTasks = this.getFilteredTasks();
        const doneCount = filteredTasks.filter(t => t.status === 'done').length;
        
        root.innerHTML = `
            <div class="animate-fade-in flex flex-col h-full w-full">
                <!-- Welcome Section (PC only) -->
                <div class="hidden md:flex flex-col gap-2 mb-10">
                    <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Eai, Meu Nobre!</h1>
                    <p class="text-gray-500 font-medium">Você tem <span id="welcome-count" class="text-primary font-bold">${filteredTasks.length - doneCount} tarefas</span> listadas.</p>
                </div>

                <!-- Stats Cards (PC only) -->
                <div class="hidden md:flex flex-wrap gap-4 mb-10">
                    <div class="flex-1 min-w-[200px] bg-white dark:bg-[#1A1B1E] p-6 rounded-[2rem] border border-outline/10 shadow-sm">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                        <p class="text-2xl font-black text-gray-900 dark:text-white">${this.state.tasks.length}</p>
                    </div>
                    <div class="flex-1 min-w-[200px] bg-white dark:bg-[#1A1B1E] p-6 rounded-[2rem] border border-outline/10 shadow-sm">
                        <p class="text-[10px] font-black text-google-blue uppercase tracking-widest mb-1">Pendentes</p>
                        <p class="text-2xl font-black text-google-blue">${this.state.tasks.filter(t => t.status !== 'done').length}</p>
                    </div>
                    <div class="flex-1 min-w-[200px] bg-white dark:bg-[#1A1B1E] p-6 rounded-[2rem] border border-outline/10 shadow-sm">
                        <p class="text-[10px] font-black text-google-green uppercase tracking-widest mb-1">Concluídas</p>
                        <p class="text-2xl font-black text-google-green">${this.state.tasks.filter(t => t.status === 'done').length}</p>
                    </div>
                </div>

                <!-- Search & Filters Bar -->
                <div class="flex flex-wrap gap-4 mb-10 items-center justify-between">
                    <div class="relative flex-grow max-w-full md:max-w-md">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input type="text" id="task-search" placeholder="Pesquisar tarefas..." value="${this.state.filters.search}" class="w-full h-14 pl-12 pr-4 bg-white dark:bg-gray-800 border-outline/20 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm">
                    </div>

                    <div class="flex gap-2 overflow-x-auto no-scrollbar">
                        ${[
                            { id: 'all', label: 'TODOS' },
                            { id: 'tomorrow', label: 'AMANHÃ' },
                            { id: 'upcoming', label: 'PRÓXIMOS' },
                            { id: 'done', label: 'CONCLUÍDOS' }
                        ].map(cat => `
                            <button data-cat="${cat.id}" class="chip flex h-11 items-center justify-center gap-2 rounded-2xl px-6 transition-all active:scale-95 border ${this.state.filters.category === cat.id ? 'bg-primary text-white border-transparent shadow-md' : 'border-outline/20 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}">
                                <span class="text-xs font-black uppercase tracking-widest whitespace-nowrap">${cat.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Task Container -->
                <div class="flex flex-col gap-2 flex-grow">
                    <div class="flex items-center justify-between py-2 mb-2">
                        <div class="flex items-center gap-4">
                            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-widest"><span id="search-results-count">${filteredTasks.length}</span> TAREFAS ENCONTRADAS</h2>
                            <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                <button id="view-list-btn" class="p-1.5 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${this.state.filters.viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-400'}">LISTA</button>
                                <button id="view-kanban-btn" class="p-1.5 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${this.state.filters.viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-400'}">KANBAN</button>
                            </div>
                        </div>
                        <div class="flex gap-2">
                             <button class="p-2 text-gray-400 hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]">sort</span></button>
                             <button class="p-2 text-gray-400 hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]">filter_list</span></button>
                        </div>
                    </div>
                    
                    <div id="tasks-display-area">
                        ${this.state.filters.viewMode === 'list' ? `
                            <div id="tasks-list-container" class="flex flex-wrap gap-6 pb-10">
                                ${filteredTasks.length ? filteredTasks.map(t => `<div class="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-shrink-0 min-w-[280px]">${UI.renderTaskCard(t, this.state.subjects)}</div>`).join('') : `
                                    <div class="w-full flex flex-col items-center justify-center py-24 text-center opacity-30">
                                        <span class="material-symbols-outlined text-8xl">task_alt</span>
                                        <p class="mt-4 font-black uppercase tracking-tighter text-2xl">Nada para mostrar</p>
                                    </div>
                                `}
                            </div>
                        ` : this.renderKanbanHTML(filteredTasks)}
                    </div>
                </div>
            </div>
        `;

        this.bindTasksPageEvents();
        if (this.state.filters.viewMode === 'kanban') this.bindKanbanEvents();
    },

    bindTasksPageEvents() {
        const searchInput = document.getElementById('task-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.state.filters.search = e.target.value;
                this.updateTasksDisplay();
            };
        }

        document.querySelectorAll('.chip').forEach(chip => {
            chip.onclick = () => {
                this.state.filters.category = chip.dataset.cat;
                this.render();
            };
        });

        const listBtn = document.getElementById('view-list-btn');
        const kanbanBtn = document.getElementById('view-kanban-btn');
        
        if (listBtn) listBtn.onclick = () => {
            this.state.filters.viewMode = 'list';
            this.render();
        };
        
        if (kanbanBtn) kanbanBtn.onclick = () => {
            this.state.filters.viewMode = 'kanban';
            this.render();
        };

        if (this.state.filters.viewMode === 'kanban') this.bindKanbanEvents();
        this.bindTaskItemEvents();
    },

    updateTasksDisplay() {
        const displayArea = document.getElementById('tasks-display-area');
        const welcomeCount = document.getElementById('welcome-count');
        const searchResultsCount = document.getElementById('search-results-count');
        
        if (!displayArea) return;

        const filteredTasks = this.getFilteredTasks();
        const doneCount = filteredTasks.filter(t => t.status === 'done').length;

        // Update counts
        if (welcomeCount) welcomeCount.innerText = `${filteredTasks.length - doneCount} tarefas`;
        if (searchResultsCount) searchResultsCount.innerText = filteredTasks.length;

        // Render content
        if (this.state.filters.viewMode === 'list') {
            displayArea.innerHTML = `
                <div id="tasks-list-container" class="flex flex-wrap gap-6 pb-10">
                    ${filteredTasks.length ? filteredTasks.map(t => `<div class="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-shrink-0 min-w-[280px]">${UI.renderTaskCard(t, this.state.subjects)}</div>`).join('') : `
                        <div class="w-full flex flex-col items-center justify-center py-24 text-center opacity-30">
                            <span class="material-symbols-outlined text-8xl">task_alt</span>
                            <p class="mt-4 font-black uppercase tracking-tighter text-2xl">Nada para mostrar</p>
                        </div>
                    `}
                </div>
            `;
        } else {
            displayArea.innerHTML = this.renderKanbanHTML(filteredTasks);
            this.bindKanbanEvents();
        }

        this.bindTaskItemEvents();
    },

    bindTaskItemEvents() {
        document.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.onchange = (e) => {
                const id = cb.dataset.id;
                const status = e.target.checked ? 'done' : 'todo';
                this.handleUpdateStatus(id, status);
            };
        });

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.closest('[data-id]').dataset.id;
                const action = btn.dataset.action;
                const task = this.state.tasks.find(t => t.id === id);
                if (action === 'delete') this.handleDeleteTask(id);
                if (action === 'edit') this.showTaskForm(task);
            };
        });
    },

    renderSubjectsConfigPage(root) {
        root.innerHTML = `
            <div class="animate-fade-in flex flex-col w-full h-full">
                <div class="flex justify-between items-center mb-10">
                    <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Matérias</h2>
                    <button id="add-sub-btn" class="h-12 px-6 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20">NOVA MATÉRIA</button>
                </div>

                <!-- Subjects Task Overview (Merged View) -->
                <div class="mb-12">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Tarefas por Categoria</h3>
                    <div class="flex flex-wrap gap-6">
                        ${this.state.subjects.length ? this.state.subjects.map(s => {
                            const tasks = this.state.tasks.filter(t => t.subject_id === s.id);
                            const pending = tasks.filter(t => t.status !== 'done').length;
                            return `
                                <div class="flex-1 min-w-[280px] bg-white dark:bg-[#1A1B1E] rounded-[2rem] p-6 border border-outline/10 shadow-sm">
                                    <div class="flex items-center justify-between mb-6">
                                        <div class="flex items-center gap-3">
                                            <div class="w-3 h-3 rounded-full" style="background-color: ${s.color}"></div>
                                            <div>
                                                <h4 class="font-bold text-gray-900 dark:text-white">${s.name}</h4>
                                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">${tasks.length} Tarefas</p>
                                            </div>
                                        </div>
                                        <div class="flex gap-1">
                                            <button class="edit-sub p-2 text-gray-400 hover:text-primary transition-colors" data-id="${s.id}"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                                            <button class="delete-sub p-2 text-gray-400 hover:text-google-red transition-colors" data-id="${s.id}"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                                        </div>
                                    </div>

                                    <div class="space-y-3">
                                        ${tasks.filter(t => t.status !== 'done').slice(0, 3).map(t => `
                                            <div class="flex items-center gap-3 text-sm group">
                                                <div class="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></div>
                                                <span class="text-gray-600 dark:text-gray-400 font-medium truncate">${t.title}</span>
                                            </div>
                                        `).join('')}
                                        ${pending === 0 ? '<p class="text-xs text-gray-300 italic py-2">Nenhuma tarefa pendente</p>' : ''}
                                        ${pending > 3 ? `<p class="text-[10px] font-black text-primary uppercase mt-2">+ ${pending - 3} outras pendentes</p>` : ''}
                                    </div>
                                    
                                    ${tasks.length > 0 ? `
                                        <div class="mt-6 pt-4 border-t border-outline/5 flex items-center justify-between">
                                            <div class="h-1.5 flex-1 bg-gray-100/50 dark:bg-white/5 rounded-full overflow-hidden mr-4">
                                                <div class="h-full bg-google-green" style="width: ${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%"></div>
                                            </div>
                                            <span class="text-[10px] font-black text-google-green">${Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}%</span>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('') : `
                            <div class="w-full py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                <p class="text-gray-400 font-medium">Nenhuma matéria cadastrada ainda.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-sub-btn').onclick = () => this.showSubjectForm();
        document.querySelectorAll('.edit-sub').forEach(btn => btn.onclick = (e) => {
            e.stopPropagation();
            this.showSubjectForm(this.state.subjects.find(s => s.id === btn.dataset.id));
        });
        document.querySelectorAll('.delete-sub').forEach(btn => btn.onclick = (e) => {
            e.stopPropagation();
            this.handleDeleteSubject(btn.dataset.id);
        });
    },

    renderBySubjectPage(root) {
        this.renderSubjectsConfigPage(root); // Redirect or alias for safety
    },

    renderKanbanHTML(filteredTasks) {
        const columns = [
            { id: 'todo', title: 'Para Fazer', dot: 'bg-google-blue' },
            { id: 'in_progress', title: 'Em Progresso', dot: 'bg-google-yellow' },
            { id: 'done', title: 'Concluído', dot: 'bg-google-green' }
        ];

        return `
            <div class="flex flex-col h-full w-full">
                <!-- Mobile instructions (pc hidden) -->
                <p class="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Arraste para mudar o status</p>

                <div class="flex flex-col md:flex-row gap-6 h-full pb-10 items-stretch">
                    ${columns.map(col => {
                        const colTasks = filteredTasks.filter(t => t.status === col.id);
                        return `
                            <div class="flex-1 flex flex-col h-full">
                                <!-- Column Header -->
                                <div class="flex items-center justify-between mb-4 px-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-3 h-3 rounded-full ${col.dot}"></div>
                                        <h3 class="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">${col.title}</h3>
                                    </div>
                                    <span class="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">${colTasks.length}</span>
                                </div>

                                <!-- Column Body -->
                                <div class="kanban-column flex-1 flex flex-col gap-4 min-h-[400px] pb-10 transition-colors overflow-y-auto no-scrollbar" data-status="${col.id}">
                                    ${colTasks.map(t => `
                                        <div class="kanban-item cursor-grab active:cursor-grabbing" draggable="true" data-id="${t.id}">
                                            ${UI.renderTaskCard(t, this.state.subjects)}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    bindKanbanEvents() {
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(col => {
            col.ondragover = (e) => {
                e.preventDefault();
                col.classList.add('bg-primary/5', 'border-primary/20');
            };
            col.ondragleave = () => {
                col.classList.remove('bg-primary/5', 'border-primary/20');
            };
            col.ondrop = (e) => {
                e.preventDefault();
                col.classList.remove('bg-primary/5', 'border-primary/20');
                const taskId = e.dataTransfer.getData('text/plain');
                if (taskId) this.handleUpdateStatus(taskId, col.dataset.status);
            };
        });

        document.querySelectorAll('.kanban-item').forEach(item => {
            item.ondragstart = (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.style.opacity = '0.4';
            };
            item.ondragend = () => item.style.opacity = '1';
        });
    },

    renderCalendarPage(root) {
        root.innerHTML = this.renderCalendarHTML(this.state.tasks);
        this.bindCalendarEvents();
    },

    renderCalendarHTML(filteredTasks) {
        if (!this.state.calendarDate) this.state.calendarDate = new Date();
        const year = this.state.calendarDate.getFullYear();
        const month = this.state.calendarDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

        let calendarRows = [];
        let week = Array(7).fill(null);
        
        // Fill empty spaces before first day
        for (let i = 0; i < firstDay; i++) week[i] = null;
        
        let currentDay = firstDay;
        for (let date = 1; date <= lastDate; date++) {
            if (currentDay === 7) {
                calendarRows.push(week);
                week = Array(7).fill(null);
                currentDay = 0;
            }
            week[currentDay] = date;
            currentDay++;
        }
        calendarRows.push(week); // last week

        return `
            <div class="animate-fade-in flex flex-col gap-6 h-full pb-32">
                <!-- Page Info (PC only) -->
                <div class="hidden md:flex flex-col gap-2 mb-4">
                    <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Calendário</h1>
                    <p class="text-gray-500 font-medium">Visualize sua jornada ao longo do mês.</p>
                </div>

                <div class="bg-white dark:bg-[#1A1B1E] rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-outline/10 flex flex-col gap-6">
                    <!-- Calendar Header -->
                    <div class="flex items-center justify-between px-2">
                        <div class="flex items-center gap-4 text-xl md:text-3xl font-black text-gray-900 dark:text-white">
                            <span>${monthNames[month]}</span>
                            <span class="opacity-30">${year}</span>
                        </div>
                        <div class="flex gap-2">
                            <button id="cal-prev" class="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl hover:text-primary transition-colors">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button id="cal-next" class="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl hover:text-primary transition-colors">
                                <span class="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <!-- Calendar Grid -->
                    <div class="grid grid-cols-7 gap-1 md:gap-3 border-t border-outline/5 pt-8">
                        ${dayNames.map(d => `<div class="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center py-4">${d}</div>`).join('')}
                        
                        ${calendarRows.map(row => row.map(d => {
                            if (d === null) return `<div class="min-h-[80px] md:min-h-[120px]"></div>`;
                            
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const dayTasks = this.state.tasks.filter(t => t.due_date === dateStr);
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;

                            return `
                                <div class="min-h-[100px] md:min-h-[140px] p-2 md:p-4 border border-outline/5 rounded-3xl flex flex-col gap-2 ${isToday ? 'bg-primary/5 border-primary/20' : ''}">
                                    <span class="text-xs md:text-sm font-black ${isToday ? 'text-primary' : 'text-gray-400'}">${d}</span>
                                    <div class="flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-[80px] md:max-h-[100px]">
                                        ${dayTasks.map(t => {
                                            const sub = this.state.subjects.find(s => s.id === t.subject_id);
                                            const bgColor = sub ? `${sub.color}20` : '#4285F415';
                                            const textColor = sub ? sub.color : '#4285F4';
                                            
                                            return `
                                                <div class="text-[9px] md:text-[10px] font-black px-2 py-1.5 rounded-xl truncate border border-transparent ${t.status === 'done' ? 'bg-gray-100 text-gray-400 line-through' : ''}" 
                                                     style="${t.status !== 'done' ? `background-color: ${bgColor}; color: ${textColor}; border-color: ${textColor}30;` : ''}">
                                                    ${t.title}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    bindCalendarEvents() {
        const prev = document.getElementById('cal-prev');
        const next = document.getElementById('cal-next');

        if (prev) prev.onclick = () => {
            this.state.calendarDate.setMonth(this.state.calendarDate.getMonth() - 1);
            this.render();
        };

        if (next) next.onclick = () => {
            this.state.calendarDate.setMonth(this.state.calendarDate.getMonth() + 1);
            this.render();
        };
    },

    getFilteredTasks() {
        return this.state.tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(this.state.filters.search.toLowerCase());
            
            let matchesCategory = true;
            if (this.state.filters.category === 'tomorrow') {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                matchesCategory = t.due_date === tomorrowStr && t.status !== 'done';
            } else if (this.state.filters.category === 'upcoming') {
                const today = new Date().toISOString().split('T')[0];
                matchesCategory = t.due_date > today && t.status !== 'done';
            } else if (this.state.filters.category === 'done') {
                matchesCategory = t.status === 'done';
            }
            
            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return a.due_date.localeCompare(b.due_date);
        });
    },

    async handleUpdatePriority(id, priority) {
        const task = this.state.tasks.find(t => t.id === id);
        if (!task) return;
        task.priority = priority;
        if (window.supabaseClient) await db.updateTask(id, { priority });
        UI.notify('Prioridade atualizada', 'success');
        this.render();
    },

    async handleUpdateStatus(id, status) {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card && status === 'done') {
            card.classList.add('animate-complete');
            await new Promise(r => setTimeout(r, 500));
        }

        const task = this.state.tasks.find(t => t.id === id);
        task.status = status;
        if (window.supabaseClient) await db.updateTask(id, { status });
        UI.notify(status === 'done' ? 'Tarefa concluída! 🎉' : 'Tarefa reaberta', 'success');
        this.render();
    },

    async handleDeleteTask(id) {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
            card.classList.add('animate-delete');
            await new Promise(r => setTimeout(r, 400));
        }

        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        if (window.supabaseClient) await db.deleteTask(id);
        UI.notify('Removido', 'info');
        this.render();
    },

    showTaskForm(task = null) {
        const content = `
            <div class="flex flex-col gap-5">
                <input type="text" id="form-task-title" placeholder="O que precisa ser feito?" autocomplete="off" value="${task ? task.title : ''}" class="w-full text-lg font-bold border-0 border-b-2 border-outline/10 bg-transparent focus:ring-0 focus:border-primary pb-2 placeholder:text-gray-300 dark:text-white">
                
                <textarea id="form-task-desc" placeholder="Adicionar detalhes..." autocomplete="off" class="w-full text-sm border-0 border-b-2 border-outline/10 bg-transparent focus:ring-0 focus:border-primary pb-2 placeholder:text-gray-400 min-h-[80px] dark:text-white/80">${task ? task.description || '' : ''}</textarea>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-400 uppercase">Prioridade</label>
                        <select id="form-task-priority" class="bg-surface-variant dark:bg-gray-800 rounded-2xl border-none text-sm h-11 px-4">
                            <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Baixa</option>
                            <option value="medium" ${task?.priority === 'medium' || !task ? 'selected' : ''}>Média</option>
                            <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>Alta</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-400 uppercase">Data</label>
                        <input type="date" id="form-task-date" value="${task ? task.due_date : ''}" class="bg-surface-variant dark:bg-gray-800 rounded-2xl border-none text-sm h-11 px-4">
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">Matéria</label>
                    <div class="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        ${this.state.subjects.map(s => `
                            <button class="sub-chip shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-outline dark:border-gray-700 transition-all ${task?.subject_id === s.id ? 'bg-primary-container dark:bg-primary/20 border-primary text-primary' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}" data-id="${s.id}">
                                <div class="w-2 h-2 rounded-full" style="background-color: ${s.color}"></div>
                                <span class="text-xs font-semibold">${s.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const { modal, close } = UI.showModal(
            task ? 'Editar Tarefa' : 'Nova Tarefa',
            content,
            `<button id="save-task" class="h-14 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20">SALVAR TAREFA</button>`
        );

        let selectedSubId = task?.subject_id || null;
        modal.querySelectorAll('.sub-chip').forEach(chip => {
            chip.onclick = () => {
                modal.querySelectorAll('.sub-chip').forEach(c => {
                    c.classList.remove('bg-primary-container', 'dark:bg-primary/20', 'border-primary', 'text-primary');
                    c.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
                });
                chip.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
                chip.classList.add('bg-primary-container', 'dark:bg-primary/20', 'border-primary', 'text-primary');
                selectedSubId = chip.dataset.id;
            };
        });

        document.getElementById('save-task').onclick = async () => {
            const data = {
                title: document.getElementById('form-task-title').value,
                description: document.getElementById('form-task-desc').value,
                priority: document.getElementById('form-task-priority').value,
                due_date: document.getElementById('form-task-date').value,
                subject_id: selectedSubId
            };
            
            if (!data.title) return UI.notify('Título obrigatório', 'warning');

            if (task) {
                Object.assign(this.state.tasks.find(t => t.id === task.id), data);
                if (window.supabaseClient) await db.updateTask(task.id, data);
            } else {
                const nt = window.supabaseClient ? await db.createTask(data) : { id: Date.now().toString(), status: 'todo', ...data };
                this.state.tasks.unshift(nt);
            }
            
            this.render();
            close();
            UI.notify('Salvo!', 'success');
        };
    },

    showSubjectForm(subject = null) {
        const content = `
            <div class="flex flex-col gap-4">
                <input type="text" id="form-sub-name" placeholder="Nome da Matéria" value="${subject ? subject.name : ''}" class="h-12 bg-surface-variant dark:bg-gray-800 dark:text-white rounded-2xl px-4 border-none font-bold">
                <div class="flex items-center gap-4 px-2">
                    <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Cor:</span>
                    <input type="color" id="form-sub-color" value="${subject ? subject.color : '#4285F4'}" class="h-10 grow border-none bg-transparent cursor-pointer">
                </div>
            </div>
        `;

        const { modal, close } = UI.showModal(
            subject ? 'Editar Matéria' : 'Nova Matéria',
            content,
            `<button id="save-sub" class="h-14 bg-gray-900 text-white rounded-2xl font-bold active:scale-95 transition-all">CONCLUIR</button>`
        );

        const nameInput = document.getElementById('form-sub-name');

        document.getElementById('save-sub').onclick = async () => {
            const data = {
                name: nameInput.value,
                color: document.getElementById('form-sub-color').value
            };
            if (!data.name) return;

            if (subject) {
                Object.assign(this.state.subjects.find(s => s.id === subject.id), data);
                if (window.supabaseClient) await db.updateSubject(subject.id, data);
            } else {
                const ns = window.supabaseClient ? await db.createSubject(data) : { id: Date.now().toString(), ...data };
                this.state.subjects.push(ns);
            }
            this.render();
            close();
        };
    },

    async handleDeleteSubject(id) {
        this.state.subjects = this.state.subjects.filter(s => s.id !== id);
        if (window.supabaseClient) await db.deleteSubject(id);
        this.render();
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
