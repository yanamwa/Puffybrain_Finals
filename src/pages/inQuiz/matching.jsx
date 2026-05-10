import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./matching.module.css";

export default function MatchingType() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [lesson, setLesson] = useState(null);
  const [firstCard, setFirstCard] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongPair, setWrongPair] = useState([]);

  useEffect(() => {
    const loadMatchingData = async () => {
      try {
        if (isLessonMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`
          );
          const data = await res.json();

          console.log("LOADED MATCHING LESSON DATA:", data);
          setLesson(data);
          return;
        }

        const deckRes = await fetch(
          `http://localhost/puffybrain/getDeckById.php?id=${deckId}`
        );
        const deckData = await deckRes.json();

        console.log("LOADED DECK DATA:", deckData);

        let cardsData = [];

        try {
          const cardsRes = await fetch(
          `http://localhost/puffybrain/getDeckCards.php?deck_id=${deckId}`
        );
          cardsData = await cardsRes.json();

          console.log("LOADED DECK CARDS:", cardsData);
        } catch (cardErr) {
          console.error("Could not load deck cards:", cardErr);
        }

        setLesson({
          ...deckData,
          cards: Array.isArray(cardsData)
            ? cardsData
            : cardsData.cards || cardsData.data || [],
        });
      } catch (err) {
        console.error("Error loading matching quiz:", err);
      }
    };

    loadMatchingData();
  }, [lessonId, deckId, isLessonMode]);

  const matchingPairs = useMemo(() => {
    if (!lesson) return [];

    let rawQuiz =
      lesson.quiz_contents ||
      lesson.quiz_content ||
      lesson.quiz ||
      lesson.questions ||
      lesson.cards ||
      lesson.flashcards ||
      lesson.deck_cards ||
      lesson.items;

    if (!rawQuiz) return [];

    try {
      const parsed = typeof rawQuiz === "string" ? JSON.parse(rawQuiz) : rawQuiz;

      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item, index) => ({
          id: item.cardId || item.card_id || item.id || index + 1,

          question:
            item.question ||
            item.front ||
            item.term ||
            item.prompt ||
            item.title ||
            "No question available.",

          answer:
            item.answer ||
            item.back ||
            item.definition ||
            item.correct_answer ||
            item.correctAnswer ||
            item.description ||
            "No answer available.",
        }))
        .filter(
          (item) =>
            item.question !== "No question available." &&
            item.answer !== "No answer available."
        );
    } catch (error) {
      console.error("Invalid matching data:", error);
      return [];
    }
  }, [lesson]);

const leftCards = useMemo(() => {
  return [...matchingPairs]
    .map((item) => ({
      id: item.id,
      text: item.question,
    }))
    .sort(() => Math.random() - 0.5);
}, [matchingPairs]);

const rightCards = useMemo(() => {
  return [...matchingPairs]
    .map((item) => ({
      id: item.id,
      text: item.answer,
    }))
    .sort(() => Math.random() - 0.5);
}, [matchingPairs]);

  const progressCurrent =
    matchingPairs.length > 0
      ? Math.round((matchedIds.length / matchingPairs.length) * 100)
      : 0;

  const isWrongCard = (card, side) =>
    wrongPair.some((item) => item.id === card.id && item.side === side);

  const handleCardClick = (card, side) => {
    if (matchedIds.includes(card.id)) return;

    if (!firstCard) {
      setFirstCard({ ...card, side });
      return;
    }

    if (firstCard.side === side) {
      setFirstCard({ ...card, side });
      return;
    }

    if (firstCard.id === card.id) {
      setMatchedIds((prev) => {
        const updated = [...prev, card.id];

        if (updated.length === matchingPairs.length) {
          localStorage.setItem(
            "matchingQuizScore",
            JSON.stringify({
              type: isLessonMode ? "lesson" : "deck",
              lessonId: isLessonMode ? Number(lessonId) : null,
              deckId: isDeckMode ? Number(deckId) : null,
              score: updated.length,
              total: matchingPairs.length,
            })
          );

          setTimeout(() => {
            if (isLessonMode) {
              navigate(`/review/${lessonId}`);
            } else {
              navigate(`/deck-review/${deckId}`);
            }
          }, 800);
        }

        return updated;
      });

      setFirstCard(null);
    } else {
      setWrongPair([firstCard, { ...card, side }]);

      setTimeout(() => {
        setWrongPair([]);
        setFirstCard(null);
      }, 500);
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
          <p>Deck cards were not loaded. Check console.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.paperBackground}>
        <header className={styles.siteHeader}>
          <h1 className={styles.courseTitle}>
            {lesson.title || lesson.deck_title || "Matching Quiz"}
          </h1>

          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressCurrent}%` }}
            ></div>
          </div>

          <h2 className={styles.pageTitle}>
            {isLessonMode ? "Lesson Matching Type" : "Deck Matching Type"}
          </h2>
        </header>

        <main className={styles.quizAppContainer}>
          <div className={styles.matchingWrapper}>
            <table>
              <tbody>
                {leftCards.map((card) => (
                  <tr key={`left-${card.id}`}>
                    <td>
                      <div
                        className={`${styles.card} ${
                          matchedIds.includes(card.id) ? styles.matched : ""
                        } ${
                          firstCard?.id === card.id &&
                          firstCard?.side === "left"
                            ? styles.selected
                            : ""
                        } ${
                          isWrongCard(card, "left") ? styles.wrongShake : ""
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
                  <tr key={`right-${card.id}`}>
                    <td>
                      <div
                        className={`${styles.card} ${
                          matchedIds.includes(card.id) ? styles.matched : ""
                        } ${
                          firstCard?.id === card.id &&
                          firstCard?.side === "right"
                            ? styles.selected
                            : ""
                        } ${
                          isWrongCard(card, "right") ? styles.wrongShake : ""
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