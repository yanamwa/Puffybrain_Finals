import { useState, useEffect } from "react";
import styles from "./multipleChoice-tutorial.module.css";

function MultipleChoice() {
  const [index, setIndex] = useState(0);

  const slides = [
    {
      question: "Which keyword is used to prevent a class from being subclassed?",
      options: ["static", "final", "const", "sealed"],
      correct: 1,
    },
    {
      question: "Which keyword is used to prevent a class from being subclassed?",
      options: ["final", "static", "const", "sealed"],
      correct: 0,
    },
    {
      question: "Which keyword is used to prevent a class from being subclassed?",
      options: ["final", "static", "const", "sealed"],
      correct: 1,
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
    <div>
      {/* HEADER */}
      <div className={styles.headerBox}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Multiple Choice Quiz</h1>
        </div>

        <div className={styles.subtitles}>
          <p className={styles.subtitle}>Pick the right one!</p>
          <p className={styles.subtitle}>
            Select the correct answer. Don’t worry if you miss, every mistake
            helps you learn!
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
                let className = "";
                if (j === slide.correct) className = styles.correct;
                return (
                  <button key={j} className={className}>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === index ? styles.active : ""}`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MultipleChoice;