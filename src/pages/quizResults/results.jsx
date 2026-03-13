import { useEffect, useState } from "react";
import styles from "./results.module.css";

export default function Result() {

  const [results, setResults] = useState({
    score: 0,
    total: 0,
    answers: []
  });

  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem("flashcardResults"));

    if (savedResults) {
      setResults(savedResults);
    } else {
      // fallback data so the design shows
      setResults({
        score: 3,
        total: 5,
        answers: [
          {
            question: "What does JVM stand for?",
            answer: "Java Virtual Machine"
          },
          {
            question: "What is inheritance?",
            answer: "A class can inherit properties and methods from another class."
          },
          {
            question: "What is polymorphism?",
            answer: "A method can behave differently depending on the object."
          }
        ]
      });
    }
  }, []);

  const retryQuiz = () => {
    localStorage.clear();
    window.location.href = "/Flashcard/tutorial_flashcard.html";
  };

  const goHome = () => {
    localStorage.clear();
    window.location.href = "../User Decks/modess.html";
  };

  return (
    <div className={styles.wrapper}>

      {/* SCORE */}
      <div className={styles.scoreSection}>
        <h1>
          You Scored <span>{results.score}</span>/<span>{results.total}</span>
        </h1>

        <p className={styles.subtitle}>
          {results.score === results.total
            ? "Great job!"
            : "Don't give up! Try again!"}
        </p>

        <div className={styles.resultButtons}>
          <button className={styles.retry} onClick={retryQuiz}>
            Try Again
          </button>

          <button className={styles.home} onClick={goHome}>
            Go Home
          </button>
        </div>
      </div>

      {/* REVIEW */}
      <div className={styles.reviewWrapper}>
        <div className={styles.reviewHeader}>
          Review the Answers
        </div>

        <div className={styles.reviewList}>
          {results.answers.map((item, index) => (
            <div key={index} className={styles.reviewItem}>
              <div className={styles.reviewQuestion}>
                {item.question}
              </div>

              <hr className={styles.reviewDivider} />

              <div className={styles.reviewAnswer}>
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}