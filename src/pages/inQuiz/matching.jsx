import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./matching.module.css";

export default function MatchingType() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [firstCard, setFirstCard] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data);
      })
      .catch((err) => console.error("Error loading lesson:", err));
  }, [lessonId]);

  const matchingPairs = useMemo(() => {
    if (!lesson?.quiz_contents) return [];

    try {
      const parsed = JSON.parse(lesson.quiz_contents);

      if (!Array.isArray(parsed)) return [];

      return parsed.map((quiz, index) => ({
        id: index + 1,
        question: quiz.question || "No question available.",
        answer:
          quiz.correct_answer ||
          quiz.correctAnswer ||
          quiz.answer ||
          "No answer available."
      }));
    } catch (error) {
      console.error("Invalid quiz JSON:", error);
      return [];
    }
  }, [lesson]);

  const leftCards = matchingPairs.map((item) => ({
    id: item.id,
    text: item.question
  }));

  const rightCards = useMemo(() => {
    return matchingPairs
      .map((item) => ({
        id: item.id,
        text: item.answer
      }))
      .sort(() => Math.random() - 0.5);
  }, [matchingPairs]);

  const progressCurrent =
    matchingPairs.length > 0
      ? Math.round((matchedIds.length / matchingPairs.length) * 100)
      : 0;

  const handleCardClick = (card, side) => {
    if (lock || matchedIds.includes(card.id)) return;

    if (!firstCard) {
      setFirstCard({ ...card, side });
      return;
    }

    if (firstCard.side === side) return;

    if (firstCard.id === card.id) {
      setMatchedIds((prev) => {
        const updated = [...prev, card.id];

        if (updated.length === matchingPairs.length) {
          localStorage.setItem(
            "matchingQuizScore",
            JSON.stringify({
              lessonId: Number(lessonId),
              score: updated.length,
              total: matchingPairs.length
            })
          );

          setTimeout(() => {
            navigate(`/review/${lessonId}`);
          }, 800);
        }

        return updated;
      });

      setFirstCard(null);
    } else {
      setLock(true);

      setTimeout(() => {
        setFirstCard(null);
        setLock(false);
      }, 700);
    }
  };

  if (!lesson) {
    return <div className={styles.wrapper}>Loading matching quiz...</div>;
  }

  if (matchingPairs.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.paperBackground}>
          <h1>No matching quiz available.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.paperBackground}>
        <header className={styles.siteHeader}>
          <h1 className={styles.courseTitle}>
            {lesson.title || "Matching Quiz"}
          </h1>

          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressCurrent}%` }}
            ></div>
          </div>

          <h2 className={styles.pageTitle}>Matching Type</h2>
        </header>

        <main className={styles.quizAppContainer}>
          <div className={styles.matchingWrapper}>
            <table>
              <tbody>
                {leftCards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div
                        className={`${styles.card} ${
                          matchedIds.includes(card.id) ? styles.matched : ""
                        } ${
                          firstCard?.id === card.id &&
                          firstCard?.side === "left"
                            ? styles.selected
                            : ""
                        }`}
                        onClick={() => handleCardClick(card, "left")}
                      >
                        {card.text}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table>
              <tbody>
                {rightCards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div
                        className={`${styles.card} ${
                          matchedIds.includes(card.id) ? styles.matched : ""
                        } ${
                          firstCard?.id === card.id &&
                          firstCard?.side === "right"
                            ? styles.selected
                            : ""
                        }`}
                        onClick={() => handleCardClick(card, "right")}
                      >
                        {card.text}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}