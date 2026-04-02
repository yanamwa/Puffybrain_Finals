import styles from "./lesson.module.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data);
      })
      .catch((err) => console.error(err));
  }, [lessonId]);

  const slides = useMemo(() => {
    if (!lesson?.lesson_content) return [];
    return lesson.lesson_content
      .split("---")
      .map((slide) => slide.trim())
      .filter((slide) => slide.length > 0);
  }, [lesson]);

  const handleNext = () => {
    const nextIndex = currentSlide + 1;

    if (nextIndex < slides.length && nextIndex % 2 === 0) {
      navigate(`/flashcard/${lessonId}`);
      return;
    }

    if (nextIndex < slides.length) {
      setCurrentSlide(nextIndex);
    } else {
      navigate(`/review/${lessonId}`);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (!lesson) {
    return <div>Loading lesson...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.ribbon}></div>

        <div className={styles.tabs}>
          <Link to={`/introduction/${lessonId}`}>
            <button className={styles.welcome}>Introduction</button>
          </Link>

          <Link to={`/lesson/${lessonId}`}>
            <button className={styles.howitworksactive}>Lesson</button>
          </Link>

          <Link to={`/review/${lessonId}`}>
            <button className={styles.aboutyou}>Review</button>
          </Link>
        </div>

        <div className={styles.greets}>
          <h2>{lesson.title}</h2>

          <h3>
            Lesson Slide {slides.length > 0 ? currentSlide + 1 : 0} of {slides.length}
          </h3>

          <div className={styles.lessonText}>
            {slides.length > 0 ? slides[currentSlide] : "No lesson content yet."}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              className={styles.button}
              onClick={handlePrevious}
              disabled={currentSlide === 0}
            >
              Previous
            </button>

            <button className={styles.button} onClick={handleNext}>
              {currentSlide === slides.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lesson;