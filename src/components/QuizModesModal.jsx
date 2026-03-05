import { useEffect, useState } from "react";
import ModeCard from "./ModeCard";
import styles from "./QuizModesModal.module.css";

export default function QuizModesModal({ onClose }) {

  const [modes, setModes] = useState([]);

  useEffect(() => {
    fetchModes();
  }, []);

  const fetchModes = async () => {
    try {

      const res = await fetch("http://localhost/puffybrain/getModes.php");
      const data = await res.json();

      if (data.success) {
        setModes(data.modes);
      }

    } catch (error) {
      console.error("Error loading modes:", error);
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

            {modes.map((mode) => (
              <ModeCard
                key={mode.id}
                title={mode.title}
                img={`http://localhost/puffybrain/images/${mode.image}`}
                desc={mode.description}
                link={mode.route}
              />
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}