const UI = {
    // Notifications (Snackbars/Toasts)
    notify(message, type = 'info') {
        const root = document.getElementById('notifications-root');
        const toast = document.createElement('div');
        
        const colors = {
            info: 'bg-gray-800 text-white',
            success: 'bg-google-green text-white',
            error: 'bg-google-red text-white',
            warning: 'bg-google-yellow text-black'
        };
        
        toast.className = `${colors[type]} px-6 py-3 rounded-full shadow-lg mb-4 pointer-events-auto flex items-center justify-center gap-2 transform transition-all duration-300 translate-y-[-20px] opacity-0 text-sm font-medium mx-4`;
        toast.innerHTML = `<span>${message}</span>`;
        
        root.appendChild(toast);
        
        // Forced reflow for animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Task Card (Responsive Design)
    renderTaskCard(task, subjects = []) {
        const subject = subjects.find(s => s.id === task.subject_id) || null;
        const isDone = task.status === 'done';
        
        const priorityData = {
            high: { color: '#EA4335', border: 'border-[#EA4335]' },
            medium: { color: '#FBBC05', border: 'border-[#FBBC05]' },
            low: { color: '#34A853', border: 'border-[#34A853]' }
        };

        const p = priorityData[task.priority] || priorityData.medium;
        const subColor = subject ? subject.color : 'var(--color-primary)';

        return `
            <div class="group relative flex flex-col justify-between p-[25px] gap-[15px] w-full min-h-[130px] bg-white dark:bg-[#1A1B1E] border-t-[3px] ${p.border} rounded-[18px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isDone ? 'opacity-50' : ''} stagger-item" data-id="${task.id}">
                
                <!-- Top Section: Title & Subject -->
                <div class="flex flex-row justify-between items-start w-full relative z-10 min-w-0 gap-3">
                    <div class="flex flex-row items-center gap-[10px] min-w-0 flex-1">
                        <!-- Checkbox -->
                        <div class="shrink-0">
                            <label class="relative flex items-center justify-center w-[24px] h-[24px] border border-black/50 dark:border-white/30 rounded-full cursor-pointer">
                                <input class="task-checkbox peer appearance-none w-full h-full rounded-full bg-white dark:bg-[#2A2B2F] checked:bg-google-green checked:border-none transition-all" type="checkbox" ${isDone ? 'checked' : ''} data-id="${task.id}">
                                <span class="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 text-[14px] pointer-events-none">check</span>
                            </label>
                        </div>
                        
                        <!-- Titles -->
                        <div class="flex flex-col justify-center min-w-0 flex-1">
                            <h3 class="text-[16px] font-bold text-black dark:text-white leading-tight truncate ${isDone ? 'line-through opacity-40' : ''}">${task.title}</h3>
                            <p class="text-[10px] font-medium text-black/50 dark:text-white/40 leading-tight truncate">${task.description || 'Sem detalhes'}</p>
                        </div>
                    </div>

                    <!-- Subject Label -->
                    ${subject ? `
                        <div class="shrink-0 px-[8px] py-[2px] bg-gray-50 dark:bg-gray-800 rounded-full border border-outline/10">
                            <span class="text-[10px] font-black uppercase tracking-wider" style="color: ${subColor}">${subject.name}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Bottom Section: Date & Actions -->
                <div class="flex flex-row justify-between items-center w-full mt-auto relative z-10 gap-2">
                    <!-- Date -->
                    <div class="flex flex-row items-center gap-[4px] shrink-0" style="color: ${p.color}">
                        <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                        <span class="text-[10px] font-bold">${task.due_date ? task.due_date.split('-').reverse().join('/') : 'Sem prazo'}</span>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-row items-center gap-[8px] shrink-0">
                        <button class="action-btn flex items-center justify-center w-[30px] h-[30px] rounded-full hover:bg-primary/10 text-primary transition-all scale-110" data-action="edit">
                            <span class="material-symbols-outlined text-[18px] filled">edit</span>
                        </button>
                        <button class="action-btn flex items-center justify-center w-[30px] h-[30px] rounded-full hover:bg-google-red/5 text-[#EA4335]/50 hover:text-[#EA4335] transition-all" data-action="delete">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Modal (Responsive Dashboard Dialog)
    showModal(title, content, actions = '') {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center justify-end bg-black/60 backdrop-blur-md transition-opacity duration-300 opacity-0';
        modal.innerHTML = `
            <div class="bg-surface dark:bg-[#1A1B1E] rounded-t-[3rem] md:rounded-[3rem] w-full md:max-w-xl mx-auto transform translate-y-full md:translate-y-10 md:scale-95 transition-all duration-300 ease-out flex flex-col max-h-[90vh] shadow-2xl border border-outline/10">
                <div class="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto my-4 shrink-0 md:hidden"></div>
                
                <div class="px-10 pt-8 pb-4 flex justify-between items-center shrink-0">
                    <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">${title}</h2>
                    <button class="close-modal w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 hover:rotate-90 transition-transform">
                        <span class="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                <div class="px-10 py-6 overflow-y-auto flex-1">
                    ${content}
                </div>

                ${actions ? `
                    <div class="px-10 py-8 shrink-0 border-t border-outline/10 flex flex-col gap-3">
                        ${actions}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('modal-container').appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
            const content = modal.querySelector('div');
            content.style.transform = window.innerWidth >= 768 ? 'translateY(0) scale(1)' : 'translateY(0)';
        }, 10);
        
        const close = () => {
            modal.style.opacity = '0';
            const content = modal.querySelector('div');
            if (window.innerWidth >= 768) {
                content.style.transform = 'translateY(20px) scale(0.95)';
            } else {
                content.style.transform = 'translateY(100%)';
            }
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.querySelector('.close-modal').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };
        
        return { modal, close };
    }
};

window.UI = UI;
