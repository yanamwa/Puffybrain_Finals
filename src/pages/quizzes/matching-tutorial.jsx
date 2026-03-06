import { useState, useEffect } from "react";
import styles from "./matching-tutorial.module.css";

function MatchingType() {
  const [slideIndex, setSlideIndex] = useState(0);

  /* AUTO SLIDE */
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 3);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getCardClass = (match, side) => {
    /* SLIDE 2 → CORRECT PAIR */
    if (slideIndex === 1 && match === "A") {
      return styles.matched;
    }

    /* SLIDE 3 → WRONG PAIR */
    if (slideIndex === 2) {
      if (side === "left" && match === "B") return styles.wrongPrevious;
      if (side === "right" && match === "C") return styles.wrongPrevious;
    }

    return "";
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.paperBackground}>
        <div className={styles.container}>

          {/* HEADER */}
          <div className={styles.quizAppContainer}>
            <div className={styles.quizHeader}>
              <h1>Matching Type</h1>
            </div>

            <div className={styles.subtitles}>
              <p>
                Find the perfect match! Pair the terms, ideas, or clues
                correctly, it's a fun way to test your memory and logic!
              </p>

              <button
                className={styles.startButton}
                onClick={() => (window.location.href = "application dep.html")}
              >
                Start
              </button>
            </div>
          </div>

          {/* SLIDES */}
          <div className={styles.slideshowBox}>

            {[0, 1, 2].map((slide) => (
              <div
                key={slide}
                className={`${styles.slide} ${
                  slideIndex === slide ? styles.active : ""
                }`}
              >
                <div className={styles.quizContent}>

                  {/* LEFT COLUMN */}
                  <div className={styles.leftColumn}>
                    <div
                      className={`${styles.card} ${getCardClass("A", "left")}`}
                    >
                      What are the 5 main components of an information system?
                    </div>

                    <div
                      className={`${styles.card} ${getCardClass("B", "left")}`}
                    >
                      What does CPU stand for and what is its main function?
                    </div>

                    <div
                      className={`${styles.card} ${getCardClass("C", "left")}`}
                    >
                      It is the component on the Arduino Uno that acts as its
                      brain.
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className={styles.rightColumn}>
                    <div
                      className={`${styles.card} ${getCardClass("B", "right")}`}
                    >
                      It processes instructions and performs calculations,
                      acting as the brain of the computer.
                    </div>

                    <div
                      className={`${styles.card} ${getCardClass("C", "right")}`}
                    >
                      The ATmega328P microcontroller.
                    </div>

                    <div
                      className={`${styles.card} ${getCardClass("A", "right")}`}
                    >
                      Hardware, Software, Data, People, and Processes.
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* PAGINATION */}
            <div className={styles.pagination}>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className={`${styles.dot} ${
                    slideIndex === dot ? styles.active : ""
                  }`}
                ></span>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchingType;