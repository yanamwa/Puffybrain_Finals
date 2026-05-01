import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeCard from "./ModeCard";
import styles from "./QuizModesModal.module.css";

export default function QuizModesModal({
  source,
  deckId,
  lessonId,
  cards = [],
  quizzes = [],
  onClose,
}) {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchModes();
  }, []);

  const isDeck = source === "deck";
  const isLesson = source === "lesson";

  const handleStartPractice = (mode) => {
    if (!mode.route) {
      console.error("Mode route is missing:", mode);
      return;
    }

    if (isDeck) {
      localStorage.setItem("practiceSource", "deck");
      localStorage.setItem("practiceDeckId", deckId);

      navigate(`${mode.route}/deck/${deckId}`);
      return;
    }

    if (isLesson) {
      localStorage.setItem("practiceSource", "lesson");
      localStorage.setItem("practiceLessonId", lessonId);

      navigate(`${mode.route}/lesson/${lessonId}`);
    }
  };

  const fetchModes = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getModes.php");

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      if (data.success && Array.isArray(data.modes)) {
        setModes(data.modes);
      } else {
        setModes([]);
      }
    } catch (error) {
      console.error("Error loading modes:", error);
      setModes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalBox}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Choose Quiz Type</h2>
          <button className={styles.closeModal} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.cardsScroll}>
          <div className={styles.modeOptions}>
            {loading ? (
              <p>Loading quiz modes...</p>
            ) : modes.length === 0 ? (
              <p>No quiz modes available.</p>
            ) : (
              modes.map((mode) => (
                <ModeCard
                  key={mode.id}
                  title={mode.title}
                  img={`http://localhost/puffybrain/images/${mode.image}`}
                  desc={mode.description}
                  onClick={() => handleStartPractice(mode)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}