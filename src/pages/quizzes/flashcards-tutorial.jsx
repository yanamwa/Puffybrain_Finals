import React, { useState } from "react";
import styles from "./flashcards-tutorial.module.css";

export default function FlashcardsTutorial() {
  const [flipped, setFlipped] = useState(false);
  const [tabLabel, setTabLabel] = useState("Question");

  const handleFlip = () => {
    setFlipped(!flipped);
    setTabLabel(!flipped ? "Answer" : "Question");
  };

  return (
    <div className={styles.flashcardsApp}>
      {/* HEADER CARD */}
      <div className={styles.headerWrapper}>
        <div className={styles.headerTop}>
          <h1>Flashcards</h1>
        </div>

        <div className={styles.headerBody}>
          <p>
            Flip, learn, and master! <br />
            Review facts and test your memory in a fun, quick, and easy way —
            perfect for learning on the go!
          </p>
          <a href="../Flashcard/flashcard.html">
            <button className={styles.startBtn}>Start</button>
          </a>
        </div>
      </div>

      {/* FLASHCARD CONTAINER */}
      <div className={styles.flashcardWrapper}>
        <div className={styles.tab}>
          <span className={styles.active}>{tabLabel}</span>
          <span onClick={handleFlip}>Flip</span>
        </div>

        <div
          className={`${styles.flashcard} ${flipped ? styles.flipped : ""}`}
          onClick={handleFlip}
        >
          <div className={styles.flashcardInner}>
            {/* FRONT (Question) */}
            <div className={styles.flashcardFace + " " + styles.front}>
              <p className={styles.question}>
                Which keyword is used to prevent a class from being subclassed?
              </p>
            </div>

            {/* BACK (Answer) */}
            <div className={styles.flashcardFace + " " + styles.back}>
              <p className={styles.question}>final</p>
            </div>
          </div>

          {/* DIFFICULTY BAR */}
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