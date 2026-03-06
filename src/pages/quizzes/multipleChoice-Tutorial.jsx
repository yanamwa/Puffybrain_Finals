import { useState, useEffect } from "react";
import styles from "./multipleChoice-tutorial.module.css";

function MultipleChoice() {
  const [index, setIndex] = useState(0);

  // Slides: each slide optionally has a "color" button
  const slides = [
    {
      question: "Which keyword is used to prevent a class from being subclassed?",
      options: ["static", "final", "const", "sealed"],
      colorIndex: null, // no color
      colorType: null,
    },
    {
      question: "Which keyword is used to prevent a class from being subclassed?",
      options: ["final", "static", "const", "sealed"],
      colorIndex: 1,    // red button
      colorType: "wrong",
    },
    {
      question: "Which keyword is used to prevent a class from being subclassed?",
      options: ["final", "static", "const", "sealed"],
      colorIndex: 0,    // green button
      colorType: "correct",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleStart = () => {
    window.location.href = "quiz1.html";
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerBox}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Multiple Choice Quiz</h1>
        </div>
        <div className={styles.subtitles}>
          <p className={styles.subtitle}>Pick the right one!</p>
          <p className={styles.subtitle}>
            Select the correct answer. Don’t worry if you miss, every mistake helps you learn!
          </p>
        </div>
        <button className={styles.startBtn} onClick={handleStart}>
          Start
        </button>
      </div>

      {/* SLIDESHOW */}
      <div className={styles.slideshowBox}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`${styles.slide} ${i === index ? styles.active : ""}`}
          >
            <p className={styles.question}>{slide.question}</p>
            <div className={styles.options}>
              {slide.options.map((option, j) => {
                let btnClass = "";
                if (j === slide.colorIndex) btnClass = slide.colorType === "correct" ? styles.correct : styles.wrong;
                return (
                  <button key={j} className={btnClass}>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* DOTS */}
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === index ? styles.activeDot : ""}`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MultipleChoice;