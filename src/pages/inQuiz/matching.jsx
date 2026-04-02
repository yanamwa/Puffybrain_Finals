import React, { useState, useEffect } from "react";
import styles from "./matching.module.css";

export default function MatchingType() {
  const [firstCard, setFirstCard] = useState(null);
  const [lock, setLock] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(20);

  const leftCards = [
    { id: 1, text: "The function that runs only once at the beginning of an Arduino program." },
    { id: 2, text: "What is the most commonly used Arduino board for beginners?" },
    { id: 3, text: "Which pin on the Arduino is used for ground connection?" },
  ];

  const rightCards = [
    { id: 1, text: "setup()" },
    { id: 2, text: "Arduino Uno" },
    { id: 3, text: "GND" },
  ];

  const handleCardClick = (card, side) => {
    if (lock || card.matched) return;

    if (!firstCard) {
      setFirstCard({ ...card, side });
      return;
    }

    if (firstCard.side === side) return;

    const first = firstCard;
    if (first.id === card.id) {
      // correct match
      first.matched = true;
      card.matched = true;
      setTimeout(() => {
        markMatched(first, card);
      }, 500);
    } else {
      // wrong match
      setLock(true);
      setTimeout(() => {
        setFirstCard(null);
        setLock(false);
      }, 700);
    }
    setFirstCard(null);
  };

  const markMatched = (card1, card2) => {
    const matchedPairs = document.querySelectorAll(`.${styles.matched}`).length / 2;
    let progress = 0;
    if (matchedPairs === 0) progress = 33;
    if (matchedPairs === 1) progress = 66;
    if (matchedPairs === 2) progress = 100;
    setProgressCurrent(progress);

    const totalCards = leftCards.length + rightCards.length;
    const matchedCards = document.querySelectorAll(`.${styles.matched}`).length;

    if (matchedCards === totalCards) {
      const score = matchedCards / 2;
      localStorage.setItem("quizScore", score);
      setTimeout(() => {
        window.location.href = "../matching-type/your score.html";
      }, 800);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.paperBackground}>
        <header className={styles.siteHeader}>
          <h1 className={styles.courseTitle}>
            APPLICATION DEVELOPMENT AND EMERGING TECHNOLOGIES
          </h1>
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressCurrent}%` }}
            ></div>
          </div>
          <h2 className={styles.pageTitle}>Matching Type</h2>
        </header>

        <main className={styles.quizAppContainer}>
          <div className={styles.matchingWrapper}>
            <table>
              <tbody>
                {leftCards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div
                        className={`${styles.card} ${
                          card.matched ? styles.matched : ""
                        }`}
                        onClick={() => handleCardClick(card, "left")}
                      >
                        {card.text}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table>
              <tbody>
                {rightCards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div
                        className={`${styles.card} ${
                          card.matched ? styles.matched : ""
                        }`}
                        onClick={() => handleCardClick(card, "right")}
                      >
                        {card.text}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}