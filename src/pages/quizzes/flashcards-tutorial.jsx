import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./flashcards-tutorial.module.css";
import "boxicons/css/boxicons.min.css";

function FlashcardsTutorial() {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className={styles.page}>
      
      {/* HEADER */}
      <div className={styles["header-wrapper"]}>
        <div className={styles["header-top"]}>
          <h1>Flashcards</h1>
        </div>

        <div className={styles["header-body"]}>
          <p>
            Flip, learn, and master! <br />
            Review facts and test your memory in a fun, quick, and easy way —
            perfect for learning on the go!
          </p>

          <Link to="/deckpage">
            <button className={styles["start-btn"]}>Start</button>
          </Link>
        </div>
      </div>

      {/* FLASHCARD SECTION */}
      <div className={styles["flashcard-wrapper"]}>
        
        {/* Tabs */}
        <div className={styles.tab}>
          <span className={styles.active}>
            {isFlipped ? "Answer" : "Question"}
          </span>

          <span onClick={flipCard}>
            Flip
          </span>
        </div>

        {/* Card */}
        <div
          className={`${styles.flashcard} ${
            isFlipped ? styles.flipped : ""
          }`}
          onClick={flipCard}
        >
          <div className={styles["flashcard-inner"]}>
            
            {/* FRONT */}
            <div className={`${styles["flashcard-face"]} ${styles.front}`}>
              <p className={styles.question}>
                Which keyword is used to prevent a class from being subclassed?
              </p>
            </div>

            {/* BACK */}
            <div className={`${styles["flashcard-face"]} ${styles.back}`}>
              <p className={styles.question}>final</p>
            </div>

          </div>

          {/* Difficulty Buttons */}
          <div className={styles.difficulty}>
            <button className={styles.easy}>Easy</button>
            <button className={styles.good}>Good</button>
            <button className={styles.hard}>Hard</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FlashcardsTutorial;