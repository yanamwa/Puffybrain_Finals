import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./qanda.module.css";

export default function QandA() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("");
  const [userResults, setUserResults] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then((res) => res.json())
      .then((data) => setLesson(data))
      .catch((err) => console.error("Error loading lesson:", err));
  }, [lessonId]);

  const questions = useMemo(() => {
    if (!lesson?.quiz_contents) return [];

    try {
      const parsed = JSON.parse(lesson.quiz_contents);
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item) => {
        const correctAnswer =
          item.correct_answer ||
          item.correctAnswer ||
          item.answer ||
          "";

        return {
          q: item.question || "No question available.",
          correctAnswer,
          explanation: item.explanation || correctAnswer,
        };
      });
    } catch (error) {
      console.error("Invalid quiz JSON:", error);
      return [];
    }
  }, [lesson]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [current]);

  const cleanAnswer = (text) => {
    return String(text)
      .toLowerCase()
      .replace(/^[a-d]\.\s*/i, "")
      .replace(/^the\s+/i, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  async function checkAnswer() {
    if (!questions[current]) return;

    try {
      const res = await fetch("http://localhost/puffybrain/checkQandA.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questions[current].q,
          userAnswer: inputValue,
          correctAnswer: questions[current].correctAnswer,
          explanation: questions[current].explanation,
        }),
      });

      const data = await res.json();
      console.log("AI CHECK RESULT:", data);

      const userClean = cleanAnswer(inputValue);
      const correctClean = cleanAnswer(questions[current].correctAnswer);

      // 🔒 STRICT fallback (ONLY exact match)
      const localCorrect = userClean === correctClean;

      // 🤖 Gemini decides meaning
      const isCorrect = data.success ? data.isCorrect : localCorrect;

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
    } catch (error) {
      console.error("Gemini check error:", error);

      // fallback if Gemini fails completely
      const userClean = cleanAnswer(inputValue);
      const correctClean = cleanAnswer(questions[current].correctAnswer);

      const localCorrect = userClean === correctClean;

      const newResult = {
        question: questions[current].q,
        userAnswer: inputValue,
        correctAnswer: questions[current].correctAnswer,
        explanation: questions[current].explanation,
        isCorrect: localCorrect,
      };

      const updatedResults = [...userResults, newResult];
      const updatedScore = score + (localCorrect ? 1 : 0);

      setUserResults(updatedResults);
      setScore(updatedScore);
      setStatus(localCorrect ? styles.correct : styles.wrong);

      setTimeout(() => {
        nextQuestion(updatedScore, updatedResults);
      }, 800);
    }
  }

  function nextQuestion(updatedScore, updatedResults) {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setInputValue("");
      setStatus("");
    } else {
      localStorage.setItem(
        "lessonQuizResults",
        JSON.stringify({
          lessonId: Number(lessonId),
          score: updatedScore,
          total: questions.length,
          answers: updatedResults,
        })
      );

      navigate(`/review/${lessonId}`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      checkAnswer();
    }
  }

  if (!lesson) {
    return <div className={styles.wrapper}>Loading Q&A...</div>;
  }

  if (questions.length === 0) {
    return <div className={styles.wrapper}>No Q&A questions available.</div>;
  }

  const progressWidth = ((current + 1) / questions.length) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{lesson.title}</h1>

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