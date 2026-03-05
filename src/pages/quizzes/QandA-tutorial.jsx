import { useState, useEffect, useRef } from "react";
import styles from "../quizzes/QandA-tutorial.module.css"; // note .module.css

const slidesData = [
  { question: 'What is the primary purpose of a "Router" in a home network?' },
  { question: "Which network device is used to amplify a Wi-Fi signal to extend coverage?" },
  { question: 'What does the acronym "LAN" commonly stand for?' },
];

const colors = [
  { bg: "rgba(255, 16, 16, 0.24)", border: "rgba(83, 9, 9, 0.7)" },
  { bg: "rgba(42, 180, 52, 0.24)", border: "rgba(16, 255, 32, 0.7)" },
];

export default function QandATutorial() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const inputRef = useRef(null);

  // Handle Enter key
  const handleEnter = (event) => {
    if (event.key === "Enter") {
      alert("You submitted: " + event.target.value);
      event.target.value = "";
    }
  };

  // Slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Input color flashing
  useEffect(() => {
    if (!inputRef.current) return;
    const flash = setInterval(() => {
      const color = colors[colorIndex];
      inputRef.current.style.backgroundColor = color.bg;
      inputRef.current.style.borderColor = color.border;
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 1900);
    return () => clearInterval(flash);
  }, [currentSlide]);

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerBox}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Q&A</h1>
        </div>

        <div className={styles.subtitles}>
          <p className={styles.subtitle}>Ask, Answer, and explore!</p>
          <p className={styles.subtitle}>
            Challenge your brain with interesting questions and discover something new every time you play!
          </p>
        </div>

        <button
          className={styles.startBtn}
          onClick={() => (window.location.href = "/TypingQuiz")}
        >
          Start
        </button>
      </div>

      {/* SLIDESHOW */}
      <div className={styles.slideshowBox}>
        {slidesData.map((slide, i) => (
          <div key={i} className={`${styles.slide} ${currentSlide === i ? styles.active : ""}`}>
            <p className={styles.question}>{slide.question}</p>
            <input
              type="text"
              className={styles.placeholder}
              placeholder="Type your answer and press Enter"
              autoComplete="off"
              onKeyDown={handleEnter}
              ref={currentSlide === i ? inputRef : null}
            />
            <p className={styles.result}></p>
          </div>
        ))}

        {/* Dots */}
        <div className={styles.dots}>
          {slidesData.map((_, i) => (
            <span key={i} className={`${styles.dot} ${currentSlide === i ? styles.active : ""}`}></span>
          ))}
        </div>
      </div>
    </div>
  );
}