import { useEffect, useState } from "react";
import ModeCard from "./ModeCard";
import styles from "./QuizModesModal.module.css";

export default function QuizModesModal({ onClose, lessonId }) {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModes();
  }, []);

  const fetchModes = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getModes.php");

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();

      console.log("Modes API response:", data);

      if (data.success && Array.isArray(data.modes)) {
        setModes(data.modes);
      } else {
        console.warn("No modes found or wrong format");
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
          <button
            className={styles.closeModal}
            onClick={onClose}
          >
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
                  link={mode.route}
                  lessonId={lessonId}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}