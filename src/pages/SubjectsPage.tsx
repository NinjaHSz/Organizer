import React from 'react';
import { FolderMinus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SubjectCard } from '../components/subjects/SubjectCard';
import { EmptyState } from '../components/common/EmptyState';

export const SubjectsPage: React.FC = () => {
  const { subjects, openNewSubjectModal } = useApp();

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32 lg:pb-12">
      {/* Grid of Subjects */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderMinus}
          title="Nenhuma matéria cadastrada"
          description="Cadastre suas disciplinas escolares ou da faculdade para organizar suas tarefas por cor e assunto."
          actionLabel="Cadastrar Primeira Matéria"
          onAction={openNewSubjectModal}
        />
      )}
    </div>
  );
};
