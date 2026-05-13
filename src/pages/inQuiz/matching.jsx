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

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);

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
  }, [lessonId, deckId, isLessonMode, deckId]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text) => {
    if (!ttsEnabled) return;

    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = voiceSpeed;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

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
      <button
        type="button"
        className={styles.settingsBtn}
        onClick={() => setSettingsOpen(true)}
      >
        <i className="bx bx-cog"></i>
        <span>settings</span>
      </button>

      {settingsOpen && (
        <div className={styles.settingsOverlay}>
          <div className={styles.settingsModal}>
            <div className={styles.settingsHeader}>
              <h2>Accessibility Settings</h2>

              <button
                type="button"
                className={styles.closeSettings}
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.settingsBody}>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingIcon}>🔊</div>
                  <div className={styles.settingText}>
                    <strong>Text to Speech</strong>
                    <span>Read cards aloud</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`${styles.switchBtn} ${
                    ttsEnabled ? styles.switchOn : ""
                  }`}
                  onClick={() => {
                    setTtsEnabled((prev) => !prev);
                    window.speechSynthesis?.cancel();
                  }}
                >
                  {ttsEnabled ? "ON" : "OFF"}
                </button>
              </div>

              <div className={styles.speedBox}>
                <div className={styles.speedHeader}>
                  <label>Voice Speed</label>
                  <span className={styles.speedValue}>
                    {voiceSpeed.toFixed(1)}x
                  </span>
                </div>

                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => {
                    setVoiceSpeed(Number(e.target.value));

                    if ("speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
                        {ttsEnabled && (
                          <button
                            type="button"
                            className={styles.cardAudioBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(card.text);
                            }}
                          >
                            <i className="bx bx-volume-full"></i>
                          </button>
                        )}

                        <span>{card.text}</span>
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
                        {ttsEnabled && (
                          <button
                            type="button"
                            className={styles.cardAudioBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(card.text);
                            }}
                          >
                            <i className="bx bx-volume-full"></i>
                          </button>
                        )}

                        <span>{card.text}</span>
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
