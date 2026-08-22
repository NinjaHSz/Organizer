import React from 'react';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { DayTaskDetails } from '../components/calendar/DayTaskDetails';

export const CalendarPage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 md:px-8 py-6 pb-32 lg:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CalendarGrid />
        </div>
        <div className="lg:col-span-5">
          <DayTaskDetails />
        </div>
      </div>
    </div>
  );
};
