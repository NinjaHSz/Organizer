import React from 'react';
import { TimetableGrid } from '../components/schedule/TimetableGrid';
import { DayScheduleCard } from '../components/schedule/DayScheduleCard';

export const SchedulePage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32 lg:pb-12 space-y-6">
      {/* Desktop Full View */}
      <TimetableGrid />

      {/* Mobile Day-by-Day View */}
      <DayScheduleCard />
    </div>
  );
};
