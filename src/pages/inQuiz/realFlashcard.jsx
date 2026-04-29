import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./realFlashcards.module.css";

export default function Flashcards() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState([]);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then((res) => res.json())
      .then((data) => setLesson(data))
      .catch((err) => console.error("Error loading lesson:", err));
  }, [lessonId]);

  const flashcards = useMemo(() => {
    if (!lesson?.quiz_contents) return [];

    try {
      const parsed = JSON.parse(lesson.quiz_contents);

      if (!Array.isArray(parsed)) return [];

      return parsed.map((item) => ({
        question: item.question || "No question available.",
        answer:
          item.correct_answer ||
          item.correctAnswer ||
          item.answer ||
          "No answer available.",
        explanation: item.explanation || ""
      }));
    } catch (error) {
      console.error("Invalid quiz JSON:", error);
      return [];
    }
  }, [lesson]);

  const currentCard = flashcards[currentIndex];

  const loadNextCard = (difficulty) => {
    if (!currentCard) return;

    const isCorrect = difficulty === "easy" || difficulty === "good";

    const newResult = {
      question: currentCard.question,
      userAnswer: difficulty,
      correctAnswer: currentCard.answer,
      explanation: currentCard.explanation || currentCard.answer,
      isCorrect
    };

    const updatedResults = [...userResults, newResult];
    const updatedScore = score + (isCorrect ? 1 : 0);

    setUserResults(updatedResults);
    setScore(updatedScore);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
    } else {
      localStorage.setItem(
        "lessonQuizResults",
        JSON.stringify({
          lessonId: Number(lessonId),
          score: updatedScore,
          total: flashcards.length,
          answers: updatedResults
        })
      );

      navigate(`/review/${lessonId}`);
    }
  };

  if (!lesson) {
    return <div className={styles.container}>Loading flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return <div className={styles.container}>No flashcards available.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.flashcardInfo}>
        <h2 className={styles.deckTitle}>{lesson.title}</h2>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentIndex + 1) / flashcards.length) * 100}%`
            }}
          ></div>
        </div>

        <p className={styles.questionCount}>
          Question {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      <div className={styles.flashcardWrapper}>
        <div className={styles.tab}>
          <span className={flipped ? "" : styles.active}>Question</span>
          <span onClick={() => setFlipped((prev) => !prev)}>Flip</span>
        </div>

        <div className={`${styles.flashcard} ${flipped ? styles.flipped : ""}`}>
          <div className={styles.flashcardInner}>
            <div className={`${styles.flashcardFace} ${styles.front}`}>
              <p>{currentCard.question}</p>
            </div>

            <div className={`${styles.flashcardFace} ${styles.back}`}>
              <p>{currentCard.answer}</p>
            </div>
          </div>

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