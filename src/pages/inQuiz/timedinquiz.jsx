import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./timedinquiz.module.css";

export default function TimedQuiz() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Timed Quiz");
  const [questions, setQuestions] = useState([]);

  const [time, setTime] = useState(() => {
    return Number(localStorage.getItem("timedQuizSeconds")) || 120;
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState([]);

  const finishedRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        if (isLessonMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`
          );

          const lesson = await res.json();
          setTitle(lesson?.title || "Lesson Timed Quiz");

          let parsed = [];

          try {
            parsed = JSON.parse(lesson?.quiz_contents || "[]");
          } catch (error) {
            console.error("Invalid lesson quiz JSON:", error);
            parsed = [];
          }

          const lessonQuestions = parsed
            .map((item) => {
              const correctAnswer =
                item.correct_answer ||
                item.correctAnswer ||
                item.answer ||
                item.correct ||
                "";

              const options = [
                ...(Array.isArray(item.options) ? item.options : []),
                ...(Array.isArray(item.choices) ? item.choices : []),
                item.option_a,
                item.option_b,
                item.option_c,
                item.option_d,
                item.choice_a,
                item.choice_b,
                item.choice_c,
                item.choice_d,
              ]
                .filter(Boolean)
                .map(String);

              return {
                question: item.question || "No question available.",
                options: [...new Set(options)],
                answer: String(correctAnswer),
                explanation: item.explanation || correctAnswer,
              };
            })
            .filter((item) => item.question && item.options.length > 0);

          setQuestions(lessonQuestions);
        }

        if (isDeckMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`
          );

          const data = await res.json();
          const cards = data.success ? data.cards || [] : [];

          setTitle("Deck Timed Quiz");

          const deckQuestions = cards
            .map((card) => {
              const correctAnswer = card.answer || "";

              const otherAnswers = cards
                .filter((c) => c.answer && c.answer !== correctAnswer)
                .map((c) => c.answer)
                .slice(0, 3);

              const options = shuffleOptions([correctAnswer, ...otherAnswers]);

              return {
                question: card.question || "No question available.",
                options: options.filter(Boolean),
                answer: correctAnswer,
                explanation: correctAnswer,
              };
            })
            .filter((item) => item.question && item.options.length > 0);

          setQuestions(deckQuestions);
        }
      } catch (error) {
        console.error("Error loading timed quiz:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, deckId, isLessonMode, isDeckMode]);

  useEffect(() => {
    if (loading || questions.length === 0 || finishedRef.current) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz(score, userResults, "timeout");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length, score, userResults]);

  function shuffleOptions(options) {
    return [...options].sort(() => Math.random() - 0.5);
  }

  function cleanAnswer(text) {
    return String(text)
      .toLowerCase()
      .replace(/^[a-d]\.\s*/i, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function handleAnswer(selectedAnswer) {
    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) return;

    const isCorrect =
      cleanAnswer(selectedAnswer) === cleanAnswer(currentQuestion.answer);

    const newResult = {
      question: currentQuestion.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.answer,
      explanation: currentQuestion.explanation,
      isCorrect,
    };

    const updatedResults = [...userResults, newResult];
    const updatedScore = score + (isCorrect ? 1 : 0);

    setUserResults(updatedResults);
    setScore(updatedScore);

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz(updatedScore, updatedResults, "completed");
    }
  }

  async function saveQuizAttempt(finalScore, finishReason) {
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
          quizMode: "timed",
          score: finalScore,
          total: questions.length,
          isTimedOut: finishReason === "timeout",
        }),
      });
    } catch (error) {
      console.error("Save attempt error:", error);
    }
  }

  async function finishQuiz(
    finalScore,
    finalResults,
    finishReason = "completed"
  ) {
    if (finishedRef.current) return;
    finishedRef.current = true;

    await saveQuizAttempt(finalScore, finishReason);

    localStorage.setItem(
      "lessonQuizResults",
      JSON.stringify({
        source: isDeckMode ? "deck" : "lesson",
        quizMode: "timed",
        finishReason,
        isTimedOut: finishReason === "timeout",
        deckId: deckId ? Number(deckId) : null,
        lessonId: lessonId ? Number(lessonId) : null,
        score: finalScore,
        total: questions.length,
        answers: finalResults,
      })
    );

    localStorage.removeItem("timedQuizSeconds");

    navigate(`/review/${lessonId || "deck"}`);
  }

  if (loading) {
    return <div className={styles.page}>Loading timed quiz...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className={styles.page}>
        No timed quiz questions available.
        <br />
        Mode: {isLessonMode ? "Lesson" : isDeckMode ? "Deck" : "None"}
        <br />
        Lesson ID: {lessonId || "none"}
        <br />
        Deck ID: {deckId || "none"}
      </div>
    );
  }

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const progress = ((questionIndex + 1) / questions.length) * 100;

  const isWarningTime = time <= 30;
  const isDangerTime = time <= 10;

  const timerClass = `${styles.timer} ${
    isDangerTime ? styles.dangerTimer : isWarningTime ? styles.warningTimer : ""
  }`;
  
  return (
    <div className={styles.page}>
      <div className={styles.quizHeader}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className={styles.subtitle}>
          Question {questionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className={styles.questionBox}>
        <div className={styles.timerBox}>
          <div className={timerClass}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <p className={styles.question}>{questions[questionIndex].question}</p>

        <div className={styles.options}>
          {questions[questionIndex].options.map((option, i) => (
            <button
              key={i}
              className={styles.option}
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}