import { useState } from "react";
import styles from "./Calendar.module.css";

function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const generateDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= numDays; d++) {
      days.push(d);
    }

    return days;
  };

  const days = generateDays();

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
    <div className={styles.calendarSection}>
      <div className={styles.calendarHeader}>
        <button className={styles.navBtn} onClick={prevMonth}>{"<"}</button>
        <span className={styles.monthYear}>{new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}</span>
        <button className={styles.navBtn} onClick={nextMonth}>{">"}</button>
      </div>

      <div className={styles.calendarWeekdays}>
        {daysOfWeek.map((day) => (
          <div key={day} className={styles.calendarWeekday}>{day}</div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {days.map((day, index) => {
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          return (
            <div
              key={index}
              className={`${styles.calendarCell} ${isToday ? styles.today : ""}`}
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
