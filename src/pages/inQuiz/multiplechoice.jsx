import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./multiplechoice.module.css";

export default function Quiz() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState([]);

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
        const options = Array.isArray(item.options) ? item.options : [];

        const correctText =
          item.correct_answer || item.correctAnswer || item.answer || "";

        const correctIndex = options.findIndex(
          (option) =>
            String(option).trim().toLowerCase() ===
            String(correctText).trim().toLowerCase()
        );

        return {
          q: item.question || "No question available.",
          options,
          correct: correctIndex,
          correctAnswer: correctText,
          explanation: item.explanation || ""
        };
      });
    } catch (error) {
      console.error("Invalid quiz JSON:", error);
      return [];
    }
  }, [lesson]);

  const question = questions[current];

  function handleAnswer(index) {
    if (locked || !question) return;

    setSelected(index);
    setLocked(true);

    const isCorrect = index === question.correct;
    const newScore = score + (isCorrect ? 1 : 0);

    const newAnswer = {
      question: question.q,
      userAnswer: question.options[index],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      isCorrect
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (isCorrect) {
      setScore(newScore);
    }

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
        setLocked(false);
      } else {
        localStorage.setItem(
          "lessonQuizResults",
          JSON.stringify({
            lessonId: Number(lessonId),
            score: newScore,
            total: questions.length,
            answers: updatedAnswers
          })
        );

        navigate(`/review/${lessonId}`);
      }
    }, 1000);
  }

  if (!lesson) {
    return <div className={styles.wrapper}>Loading quiz...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Multiple Choice</h1>
          <p className={styles.subtitle}>No quiz questions available.</p>
        </div>
      </div>
    );
  }

  const progressPercent = ((current + 1) / questions.length) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{lesson.title}</h1>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className={styles.subtitle}>
          Question {current + 1} of {questions.length}
        </p>
      </div>

      <div className={styles.questionBox}>
        <p className={styles.question}>{question.q}</p>

        <div className={styles.options}>
          {question.options.map((opt, i) => {
            let optionClass = styles.option;

            if (selected !== null) {
              if (i === question.correct) {
                optionClass = `${styles.option} ${styles.correct}`;
              } else if (i === selected) {
                optionClass = `${styles.option} ${styles.wrong}`;
              }
            }

            return (
              <button
                key={i}
                className={optionClass}
                onClick={() => handleAnswer(i)}
                disabled={locked}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}