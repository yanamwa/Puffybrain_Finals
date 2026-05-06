import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./qanda.module.css";

export default function QandA() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [lesson, setLesson] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("");
  const [userResults, setUserResults] = useState([]);

  const inputRef = useRef(null);

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
        console.error("Error loading Q&A:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, deckId, isLessonMode, isDeckMode]);

  const questions = useMemo(() => {
    if (isLessonMode && lesson?.quiz_contents) {
      try {
        const parsed = JSON.parse(lesson.quiz_contents);
        if (!Array.isArray(parsed)) return [];

        return parsed.map((item) => ({
          q: item.question || "No question available.",
          correctAnswer:
            item.correct_answer || item.correctAnswer || item.answer || "",
          explanation: item.explanation || item.answer,
        }));
      } catch {
        return [];
      }
    }

    if (isDeckMode) {
      return deckCards.map((card) => ({
        q: card.question || "No question available.",
        correctAnswer: card.answer || "",
        explanation: card.answer || "",
      }));
    }

    return [];
  }, [lesson, deckCards, isLessonMode, isDeckMode]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [current]);

  const cleanAnswer = (text) =>
    String(text).toLowerCase().replace(/[^\w\s]/g, "").trim();

  // ✅ ADD THIS (SAVE TO DB)
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
          quizMode: "qna",
          score: finalScore,
          total: questions.length,
          isTimedOut: false,
        }),
      });
    } catch (error) {
      console.error("Save attempt error:", error);
    }
  }

  async function checkAnswer() {
    if (!questions[current]) return;

    const userClean = cleanAnswer(inputValue);
    const correctClean = cleanAnswer(questions[current].correctAnswer);

    const isCorrect = userClean === correctClean;

    const newResult = {
      question: questions[current].q,
      userAnswer: inputValue,
      correctAnswer: questions[current].correctAnswer,
      explanation: questions[current].explanation,
      isCorrect,
    };

    const updatedResults = [...userResults, newResult];
    const updatedScore = score + (isCorrect ? 1 : 0);

    setUserResults(updatedResults);
    setScore(updatedScore);
    setStatus(isCorrect ? styles.correct : styles.wrong);

    setTimeout(() => {
      nextQuestion(updatedScore, updatedResults);
    }, 800);
  }

  async function nextQuestion(updatedScore, updatedResults) {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setInputValue("");
      setStatus("");
      return;
    }

    // ✅ SAVE ATTEMPT FIRST
    await saveQuizAttempt(updatedScore);

    localStorage.setItem(
      "lessonQuizResults",
      JSON.stringify({
        source: isDeckMode ? "deck" : "lesson",
        quizMode: "qna",
        deckId: deckId ? Number(deckId) : null,
        lessonId: lessonId ? Number(lessonId) : null,
        score: updatedScore,
        total: questions.length,
        answers: updatedResults,
      })
    );

    navigate(`/review/${lessonId || "deck"}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      checkAnswer();
    }
  }

  if (loading) return <div className={styles.wrapper}>Loading Q&A...</div>;
  if (questions.length === 0)
    return <div className={styles.wrapper}>No Q&A questions available.</div>;

  const progressWidth = ((current + 1) / questions.length) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isLessonMode ? lesson?.title || "Lesson Q&A" : "Deck Q&A"}
        </h1>

        <div className={styles.counter}>
          Question {current + 1} of {questions.length}
        </div>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      <div className={styles.questionBox}>
        <p className={styles.question}>{questions[current].q}</p>

        <div className={styles.typingContainer}>
          <input
            ref={inputRef}
            type="text"
            className={`${styles.input} ${status}`}
            placeholder="Type your answer"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}