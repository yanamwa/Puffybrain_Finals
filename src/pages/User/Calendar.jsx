// Calendar.jsx
import { useState } from "react";

function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get all days to display in the grid
  const generateDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let d = 1; d <= numDays; d++) {
      days.push(d);
    }

    return days;
  };

  const days = generateDays();

  // Handlers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth}>{"<"}</button>
        <span>{new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}</span>
        <button className="nav-btn" onClick={nextMonth}>{">"}</button>
      </div>

      {/* Days of week */}
      <div className="calendar-weekdays">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      {/* Dates */}
      <div className="calendar-grid">
        {days.map((day, index) => {
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          return (
            <div
              key={index}
              className={`calendar-cell ${isToday ? "today" : ""}`}
            >
              {day || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
