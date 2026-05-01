import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./multipleChoice-tutorial.module.css";

const slidesData = [
  {
    question: "Which keyword is used to prevent a class from being subclassed?",
    options: ["static", "final", "const", "sealed"],
    colorIndex: null,
    colorType: null,
  },
  {
    question: "Which keyword is used to prevent a class from being subclassed?",
    options: ["final", "static", "const", "sealed"],
    colorIndex: 1,
    colorType: "wrong",
  },
  {
    question: "Which keyword is used to prevent a class from being subclassed?",
    options: ["final", "static", "const", "sealed"],
    colorIndex: 0,
    colorType: "correct",
  },
];

export default function MultipleChoiceTutorial() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

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
            Select the correct answer. Don’t worry if you miss, every mistake
            helps you learn!
          </p>
        </div>

        <button
          className={styles.startBtn}
          onClick={() => navigate(`/multiple-choice/${lessonId}`)}
        >
          Start
        </button>
      </div>

      {/* SLIDESHOW */}
      <div className={styles.slideshowBox}>
        {slidesData.map((slide, i) => (
          <div
            key={i}
            className={`${styles.slide} ${
              currentSlide === i ? styles.active : ""
            }`}
          >
            <p className={styles.question}>{slide.question}</p>

            <div className={styles.options}>
              {slide.options.map((option, j) => {
                let btnClass = "";

                if (j === slide.colorIndex) {
                  btnClass =
                    slide.colorType === "correct"
                      ? styles.correct
                      : styles.wrong;
                }

                return (
                  <button
                    key={j}
                    type="button"
                    className={btnClass}
                    disabled
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* DOTS */}
        <div className={styles.dots}>
          {slidesData.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${
                currentSlide === i ? styles.activeDot : ""
              }`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}