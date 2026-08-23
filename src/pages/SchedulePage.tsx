import React from 'react';
import { TimetableGrid } from '../components/schedule/TimetableGrid';
import { DayScheduleCard } from '../components/schedule/DayScheduleCard';

export const SchedulePage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 pt-0 md:pt-6 pb-32 lg:pb-12">
      {/* Desktop Full View */}
      <TimetableGrid />

      {/* Mobile Day-by-Day View */}
      <DayScheduleCard />
    </div>
  );
};
