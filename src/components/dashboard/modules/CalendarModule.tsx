import { useState } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';

const CalendarModule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="h-full">
      <CalendarView 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate} 
      />
    </div>
  );
};

export default CalendarModule;