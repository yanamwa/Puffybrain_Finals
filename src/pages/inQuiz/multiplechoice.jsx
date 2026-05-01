import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./multiplechoice.module.css";

export default function Quiz() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [title, setTitle] = useState("Multiple Choice");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState([]);

  const makeFallbackQuestions = (cards) => {
    return cards.map((card) => {
      const correctAnswer = card.answer || "No answer available.";

      const wrongOptions = [
        "None of the above",
        "All of the above",
        "Not applicable",
      ];

      const options = [...wrongOptions, correctAnswer].sort(
        () => Math.random() - 0.5
      );

      const correct = options.findIndex((opt) => opt === correctAnswer);

      return {
        q: card.question || "No question available.",
        options,
        correct,
        correctAnswer,
        explanation: correctAnswer,
      };
    });
  };

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);

      try {
        if (isLessonMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`
          );

          const lesson = await res.json();
          setTitle(lesson.title || "Lesson Quiz");

          const parsed = JSON.parse(lesson.quiz_contents || "[]");

          const lessonQuestions = parsed.map((item) => {
            const options = Array.isArray(item.options) ? item.options : [];

            const correctAnswer =
              item.correct_answer || item.correctAnswer || item.answer || "";

            const correct = options.findIndex(
              (opt) =>
                String(opt).trim().toLowerCase() ===
                String(correctAnswer).trim().toLowerCase()
            );

            return {
              q: item.question || "No question available.",
              options,
              correct,
              correctAnswer,
              explanation: item.explanation || correctAnswer,
            };
          });

          setQuestions(lessonQuestions);
        }

        if (isDeckMode) {
          const cardsRes = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`
          );

          const cardsData = await cardsRes.json();
          const cards = cardsData.success ? cardsData.cards || [] : [];

          console.log("CARDS FOR GEMINI:", cards);

          if (cards.length === 0) {
            setQuestions([]);
            return;
          }

          const geminiRes = await fetch(
            "http://localhost/puffybrain/generateDeckMCQ.php",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cards }),
            }
          );

          const geminiData = await geminiRes.json();
          console.log("GEMINI RESPONSE:", geminiData);

          if (!geminiData.success || !Array.isArray(geminiData.questions)) {
            console.warn("Gemini failed. Using fallback choices.");

            setTitle("Deck Quiz");
            setQuestions(makeFallbackQuestions(cards));
            return;
          }

          const deckQuestions = geminiData.questions.map((item) => {
            const options = Array.isArray(item.options) ? item.options : [];

            const correctAnswer =
              item.correctAnswer || item.correct_answer || item.answer || "";

            const correct = options.findIndex(
              (opt) =>
                String(opt).trim().toLowerCase() ===
                String(correctAnswer).trim().toLowerCase()
            );

            return {
              q: item.question || "No question available.",
              options,
              correct: correct >= 0 ? correct : 0,
              correctAnswer,
              explanation: item.explanation || correctAnswer,
            };
          });

          setTitle("Deck Quiz");
          setQuestions(deckQuestions);
        }
      } catch (error) {
        console.error("Error loading multiple choice:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [lessonId, deckId, isLessonMode, isDeckMode]);

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
      isCorrect,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (isCorrect) {
      setScore(newScore);
    }

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
        setLocked(false);
        return;
      }

      localStorage.setItem(
        "lessonQuizResults",
        JSON.stringify({
          source: isDeckMode ? "deck" : "lesson",
          deckId: deckId ? Number(deckId) : null,
          lessonId: lessonId ? Number(lessonId) : null,
          score: newScore,
          total: questions.length,
          answers: updatedAnswers,
        })
      );

      navigate(`/review/${lessonId || "deck"}`);
    }, 1000);
  }

  if (loading) {
    return <div className={styles.wrapper}>Generating quiz...</div>;
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
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progressPercent}%` }}
          />
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