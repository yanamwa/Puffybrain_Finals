import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./realFlashcards.module.css";

export default function Flashcards() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [lesson, setLesson] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState([]);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        if (isLessonMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`
          );
          const data = await res.json();
          setLesson(data);
        }

        if (isDeckMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`
          );
          const data = await res.json();

          if (data.success) {
            setDeckCards(data.cards || []);
          } else {
            setDeckCards([]);
          }
        }
      } catch (err) {
        console.error("Error loading flashcards:", err);
        setDeckCards([]);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, deckId, isLessonMode, isDeckMode]);

  const flashcards = useMemo(() => {
    if (isLessonMode && lesson?.quiz_contents) {
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
          explanation: item.explanation || "",
        }));
      } catch (error) {
        console.error("Invalid quiz JSON:", error);
        return [];
      }
    }

    if (isDeckMode) {
      return deckCards.map((card) => ({
        question: card.question || "No question available.",
        answer: card.answer || "No answer available.",
        explanation: "",
      }));
    }

    return [];
  }, [lesson, deckCards, isLessonMode, isDeckMode]);

  const currentCard = flashcards[currentIndex];

  const loadNextCard = (difficulty) => {
    if (!currentCard) return;

    const isCorrect = difficulty === "easy" || difficulty === "good";

    const newResult = {
      question: currentCard.question,
      userAnswer: difficulty,
      correctAnswer: currentCard.answer,
      explanation: currentCard.explanation || currentCard.answer,
      isCorrect,
    };

    const updatedResults = [...userResults, newResult];
    const updatedScore = score + (isCorrect ? 1 : 0);

    setUserResults(updatedResults);
    setScore(updatedScore);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
      return;
    }

    const resultData = {
      source: isDeckMode ? "deck" : "lesson",
      deckId: deckId ? Number(deckId) : null,
      lessonId: lessonId ? Number(lessonId) : null,
      score: updatedScore,
      total: flashcards.length,
      answers: updatedResults,
    };

    localStorage.setItem("lessonQuizResults", JSON.stringify(resultData));

    navigate(`/review/${lessonId || "deck"}`);
    }

  if (loading) {
    return <div className={styles.container}>Loading flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return <div className={styles.container}>No flashcards available.</div>;
  }

    return (
    <div className={styles.container}>
      <div className={styles.flashcardInfo}>
        <h2 className={styles.deckTitle}>
          {isLessonMode
            ? lesson?.title || "Lesson Flashcards"
            : "Deck Flashcards"}
        </h2>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
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

        <div
          className={`${styles.flashcard} ${flipped ? styles.flipped : ""}`}
          onClick={() => setFlipped((prev) => !prev)}
        >
          <div className={styles.flashcardInner}>
            <div className={`${styles.flashcardFace} ${styles.front}`}>
              <p>{currentCard.question}</p>
            </div>

            <div className={`${styles.flashcardFace} ${styles.back}`}>
              <p>{currentCard.answer}</p>
            </div>
          </div>

          <div className={styles.difficulty}>
            <button
              className={styles.easy}
              onClick={(e) => {
                e.stopPropagation();
                loadNextCard("easy");
              }}
            >
              Easy
            </button>

            <button
              className={styles.good}
              onClick={(e) => {
                e.stopPropagation();
                loadNextCard("good");
              }}
            >
              Good
            </button>

            <button
              className={styles.hard}
              onClick={(e) => {
                e.stopPropagation();
                loadNextCard("hard");
              }}
            >
              Hard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}