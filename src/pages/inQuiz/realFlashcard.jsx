import { useState } from "react";
import styles from "./realFlashcards.module.css";

export default function Flashcards() {
  const flashcards = [
    {
      question: "What does JVM stand for?",
      answer: "Java Virtual Machine",
    },
    {
      question: "What is inheritance in Java?",
      answer:
        "Inheritance allows one class to inherit fields and methods from another using the extends keyword.",
    },
    {
      question: "What is a package in Java?",
      answer: "A package is a collection of related classes and interfaces.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState([]);
  const [flipped, setFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  const loadNextCard = (difficulty) => {
    const isCorrect = difficulty === "easy" || difficulty === "good";
    if (isCorrect) setScore((prev) => prev + 1);

    setUserResults((prev) => [
      ...prev,
      {
        question: currentCard.question,
        answer: currentCard.answer,
        correct: isCorrect,
      },
    ]);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    localStorage.setItem(
      "flashcardResults",
      JSON.stringify({
        score,
        total: flashcards.length,
        answers: userResults,
      })
    );

    window.location.href = "/flash_result"; // adjust route as needed
  };

  return (
    <div className={styles.container}>
      {/* TOP INFO */}
      <div className={styles.flashcardInfo}>
        <h2 className={styles.deckTitle}>Introduction to Programming</h2>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          ></div>
        </div>

        <p className={styles.questionCount}>
          Question {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      {/* FLASHCARD */}
      <div className={styles.flashcardWrapper}>
        <div className={styles.tab}>
          <span className={flipped ? "" : styles.active}>Question</span>
          <span onClick={() => setFlipped((prev) => !prev)}>Flip</span>
        </div>

        <div
          className={`${styles.flashcard} ${flipped ? styles.flipped : ""}`}
        >
          <div className={styles.flashcardInner}>
            {/* FRONT */}
            <div className={`${styles.flashcardFace} ${styles.front}`}>
              <p>{currentCard.question}</p>
            </div>

            {/* BACK */}
            <div className={`${styles.flashcardFace} ${styles.back}`}>
              <p>{currentCard.answer}</p>
            </div>
          </div>

          {/* DIFFICULTY BUTTONS */}
          <div className={styles.difficulty}>
            <button className={styles.easy} onClick={() => loadNextCard("easy")}>
              Easy
            </button>
            <button className={styles.good} onClick={() => loadNextCard("good")}>
              Good
            </button>
            <button className={styles.hard} onClick={() => loadNextCard("hard")}>
              Hard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}