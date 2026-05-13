import { useState, useEffect } from "react";
import styles from "../quizzes/QandA-tutorial.module.css";
import { useNavigate, useParams } from "react-router-dom";

const slidesData = [
  {
    question: 'What is the primary purpose of a "Router" in a home network?',
    status: "correct",
    answer: "Correct Answer: Connect devices to the internet",
  },

  {
    question:
      "Which network device is used to amplify a Wi-Fi signal to extend coverage?",
    status: "wrong",
    answer: "Incorrect Answer",
  },

  {
    question: 'What does the acronym "LAN" commonly stand for?',
    status: "correct",
    answer: "Correct Answer: Local Area Network",
  },
];

export default function QandATutorial() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const [currentSlide, setCurrentSlide] = useState(0);

  /* AUTO SLIDE */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.headerBox}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Q&A</h1>
        </div>

        <div className={styles.subtitles}>
          <p className={styles.subtitle}>
            Ask, Answer, and explore!
          </p>

          <p className={styles.subtitle}>
            Challenge your brain with interesting questions and
            discover something new every time you play!
          </p>
        </div>

        <button
          className={styles.startBtn}
          onClick={() => {

            if (lessonId) {
              navigate(`/qna/lesson/${lessonId}`);
              return;
            }

            if (deckId) {
              navigate(`/qna/deck/${deckId}`);
              return;
            }
          }}
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

            {/* QUESTION */}
            <p className={styles.question}>
              {slide.question}
            </p>

            {/* ANSWER BOX */}
            <div
              className={`${styles.answerBox} ${
                slide.status === "correct"
                  ? styles.correct
                  : styles.wrong
              }`}
            >
              {slide.answer}
            </div>

          </div>
        ))}

        {/* DOTS */}
        <div className={styles.dots}>
          {slidesData.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${
                currentSlide === i ? styles.active : ""
              }`}
            ></span>
          ))}
        </div>

      </div>
    </div>
  );
}