import React from 'react';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskList } from '../components/tasks/TaskList';

export const DashboardPage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32 lg:pb-12">
      <TaskFilters />
      <TaskList />
    </div>
  );
};
