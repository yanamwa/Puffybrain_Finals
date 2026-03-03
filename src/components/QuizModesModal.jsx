import ModeCard from "./ModeCard";
import styles from "./QuizModesModal.module.css";

export default function QuizModesModal({ onClose }) {
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
            <ModeCard
              title="Survival Mode"
              img="/images/hearts.png"
              desc="Each wrong answer costs a life. Stay focused, and see how long you can survive!"
              link="/survival-mode"
            />

            <ModeCard
              title="Flashcards"
              img="/images/flashcard.png"
              desc="Review facts and test your memory in a fun and quick way. Perfect for learning on the go!"
              link="/flashcards"
            />

            <ModeCard
              title="Q & A"
              img="/images/q&a.png"
              desc="Challenge your brain with interesting questions and discover something new every time you play!"
              link="/qna"
            />

            <ModeCard
              title="Multiple Choice"
              img="/images/multiplechoice.png"
              desc="Only one answer is correct. Trust your instincts, think carefully, and aim for that perfect score!"
              link="/multiple-choice"
            />

            <ModeCard
              title="Matching Type"
              img="/images/matching.png"
              desc="Pair the terms, ideas, or clues correctly. It's a fun way to test your memory and logic!"
              link="/matching-type"
            />
          </div>
        </div>
      </div>
    </div>
  );
}