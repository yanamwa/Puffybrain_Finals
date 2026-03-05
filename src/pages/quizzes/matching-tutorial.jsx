import React from "react";
import styles from "./matching-tutorial.module.css";

function MatchingTutorial() {
  return (
    <div className={styles.paperBackground}>
      {/* MAIN CONTAINER */}
      <div className={styles.container}>
        <div className={styles.quizAppContainer}>
          <div className={styles.quizHeader}>
            <h1>Matching Type</h1>
          </div>

          <div className={styles.subtitles}>
            <p>
              Find the perfect match! Pair the terms, ideas, or clues correctly, it's a fun way to test your memory and logic!
            </p>
            <button className={styles.startButton}>Start</button>
          </div>
        </div>

        {/* SLIDESHOW */}
        <div className={styles.slideshowBox}>
          {/* SLIDE 1 */}
          <div className={`${styles.slide} ${styles.active}`}>
            <div className={styles.quizContent}>
              <div className={styles.column + " " + styles.leftColumn}>
                <div className={styles.card} data-match="A">
                  What are the 5 main components of an information system?
                </div>
                <div className={styles.card} data-match="B">
                  What does CPU stand for and what is its main function?
                </div>
                <div className={styles.card} data-match="C">
                  It is the component on the Arduino Uno that acts as its brain.
                </div>
              </div>

              <div className={styles.column + " " + styles.rightColumn}>
                <div className={styles.card} data-match="B">
                  It processes instructions and performs calculations, acting as the brain of the computer.
                </div>
                <div className={styles.card} data-match="C">
                  The ATmega328P microcontroller.
                </div>
                <div className={styles.card} data-match="A">
                  Hardware, Software, Data, People, and Processes.
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2 */}
          <div className={styles.slide}>
            <div className={styles.quizContent}>
              <div className={styles.column + " " + styles.leftColumn}>
                <div className={styles.card} data-match="A">
                  What are the 5 main components of an information system?
                </div>
                <div className={styles.card} data-match="B">
                  What does CPU stand for and what is its main function?
                </div>
                <div className={styles.card} data-match="C">
                  It is the component on the Arduino Uno that acts as its brain.
                </div>
              </div>

              <div className={styles.column + " " + styles.rightColumn}>
                <div className={styles.card} data-match="B">
                  It processes instructions and performs calculations, acting as the brain of the computer.
                </div>
                <div className={styles.card} data-match="C">
                  The ATmega328P microcontroller.
                </div>
                <div className={styles.card} data-match="A">
                  Hardware, Software, Data, People, and Processes.
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 3 */}
          <div className={styles.slide}>
            <div className={styles.quizContent}>
              <div className={styles.column + " " + styles.leftColumn}>
                <div className={styles.card} data-match="A">
                  What are the 5 main components of an information system?
                </div>
                <div className={styles.card} data-match="B">
                  What does CPU stand for and what is its main function?
                </div>
                <div className={styles.card} data-match="C">
                  It is the component on the Arduino Uno that acts as its brain.
                </div>
              </div>

              <div className={styles.column + " " + styles.rightColumn}>
                <div className={styles.card} data-match="B">
                  It processes instructions and performs calculations, acting as the brain of the computer.
                </div>
                <div className={styles.card} data-match="C">
                  The ATmega328P microcontroller.
                </div>
                <div className={styles.card} data-match="A">
                  Hardware, Software, Data, People, and Processes.
                </div>
              </div>
            </div>
          </div>

          {/* DOTS */}
          <div className={styles.pagination}>
            <span className={`${styles.dot} ${styles.active}`}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchingTutorial;