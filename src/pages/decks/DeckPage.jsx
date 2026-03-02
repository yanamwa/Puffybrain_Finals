import { useState } from "react";
import QuizModesModal from "../../components/QuizModesModal";
import styles from "./deck.module.css";

export default function DeckPage() {
  const [openModes, setOpenModes] = useState(false);

  return (
    <>
      <div className={styles.deckPage}>
        <button
          className={styles.practiceBtn}
          onClick={() => setOpenModes(true)}
        >
          Practice
        </button>
      </div>

      {openModes && (
        <QuizModesModal onClose={() => setOpenModes(false)} />
      )}
    </>
  );
}