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

  const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};
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

          setDeckCards(data.success ? data.cards || [] : []);
        }
      } catch (err) {
        console.error("Error loading flashcards:", err);
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

return shuffleArray(
  parsed.map((item) => ({
    question: item.question || "No question available.",
    answer:
      item.correct_answer ||
      item.correctAnswer ||
      item.answer ||
      "No answer available.",
    explanation: item.explanation || "",
  }))
);
      } catch {
        return [];
      }
    }
if (isDeckMode) {
  return shuffleArray(
    deckCards.map((card) => ({
      question: card.question || "No question available.",
      answer: card.answer || "No answer available.",
      explanation: "",
    }))
  );
}
    return [];
  }, [lesson, deckCards, isLessonMode, isDeckMode]);

  const currentCard = flashcards[currentIndex];
  async function saveQuizAttempt(finalScore) {
    try {
      await fetch("http://localhost/puffybrain/saveQuizAttempt.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          source: isDeckMode ? "deck" : "lesson",
          lessonId: lessonId ? Number(lessonId) : null,
          deckId: deckId ? Number(deckId) : null,
          quizMode: "flashcard",
          score: finalScore,
          total: flashcards.length,
          isTimedOut: false,
        }),
      });
    } catch (error) {
      console.error("Save flashcard attempt error:", error);
    }
  }

  const loadNextCard = async (difficulty) => {
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

    // 🔥 SAVE ATTEMPT FIRST
    await saveQuizAttempt(updatedScore);

    // 🔥 SAVE RESULT
    localStorage.setItem(
      "lessonQuizResults",
      JSON.stringify({
        source: isDeckMode ? "deck" : "lesson",
        quizMode: "flashcard",
        deckId: deckId ? Number(deckId) : null,
        lessonId: lessonId ? Number(lessonId) : null,
        score: updatedScore,
        total: flashcards.length,
        answers: updatedResults,
      })
    );

    navigate(`/review/${lessonId || "deck"}`);
  };

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
          <span className={!flipped ? styles.active : ""}>Question</span>
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
          <p className={styles.difficultyHint}>
              Easy = mastered • Good = understood • Hard = needs review
            </p>
        </div>
      </div>
    </div>
  );
}