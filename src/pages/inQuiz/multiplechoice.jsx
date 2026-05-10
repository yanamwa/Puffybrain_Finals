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

  const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

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

          setQuestions(shuffleArray(lessonQuestions));
        }

        if (isDeckMode) {
          const cardsRes = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`
          );

          const cardsData = await cardsRes.json();
          const cards = cardsData.success ? cardsData.cards || [] : [];

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

          if (!geminiData.success || !Array.isArray(geminiData.questions)) {
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
            setQuestions(shuffleArray(deckQuestions));   
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
          quizMode: "multiple",
          score: finalScore,
          total: questions.length,
          isTimedOut: false,
        }),
      });
    } catch (error) {
      console.error("Save attempt error:", error);
    }
  }

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

    setTimeout(async () => {
      if (current + 1 < questions.length) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
        setLocked(false);
        return;
      }

      // 🔥 SAVE ATTEMPT FIRST
      await saveQuizAttempt(newScore);

      // 🔥 SAVE RESULT FOR RESULT PAGE
      localStorage.setItem(
        "lessonQuizResults",
        JSON.stringify({
          source: isDeckMode ? "deck" : "lesson",
          quizMode: "multiple",
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
        <h1>No quiz questions available.</h1>
      </div>
    );
  }

  const progressPercent = ((current + 1) / questions.length) * 100;

  const cleanOptions = (question.options || []).filter(
  (opt) => opt && String(opt).trim() !== ""
);

const isTrueFalse = cleanOptions.some(
  (opt) =>
    String(opt).trim().toLowerCase() === "true" ||
    String(opt).trim().toLowerCase() === "false"
);

const visibleOptions = isTrueFalse
  ? cleanOptions.filter((opt) =>
      ["true", "false"].includes(String(opt).trim().toLowerCase())
    )
  : cleanOptions.slice(0, 4);

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
  {visibleOptions.map((opt, i) => {
    let optionClass = styles.option;

    const isSelected = selected === opt;
    const isCorrect = String(opt).trim().toLowerCase() ===
      String(question.correctAnswer).trim().toLowerCase();

    if (selected !== null && isSelected) {
      optionClass = isCorrect
        ? `${styles.option} ${styles.correct}`
        : `${styles.option} ${styles.wrong}`;
    }

    return (
      <button
        key={i}
        className={optionClass}
        onClick={() => handleAnswer(question.options.indexOf(opt))}
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