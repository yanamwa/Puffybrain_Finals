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

  const cleanQuestionText = (text = "") => {
    return String(text)
      .replace(/\s*A\..*/is, "")
      .trim();
  };

  const cleanAnswerText = (text = "") => {
    const raw = String(text).trim();

    const match = raw.match(/Correct Answer:\s*(.+)$/i);
    if (match) return match[1].trim();

    return raw.replace(/^[A-D]\.\s*/i, "").trim();
  };

  const shuffleArray = (array) => {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  };

  useEffect(() => {
    const loadMatchingData = async () => {
      try {
        if (isLessonMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`,
            { credentials: "include" }
          );

          const data = await res.json();

          setLesson({
            ...data,
            title: data.title || "Matching Quiz",
          });

          return;
        }

        if (isDeckMode) {
          const deckRes = await fetch(
            `http://localhost/puffybrain/getDeckById.php?deckId=${deckId}`,
            { credentials: "include" }
          );

          const deckData = await deckRes.json();
          console.log("LOADED DECK DATA:", deckData);

          const cardsRes = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`,
            { credentials: "include" }
          );

          const cardsData = await cardsRes.json();
          console.log("LOADED DECK CARDS:", cardsData);

          const deckInfo = deckData.success ? deckData.deck || {} : {};
          const cards = cardsData.success ? cardsData.cards || [] : [];

          setLesson({
            ...deckInfo,
            title:
              deckInfo.title ||
              deckInfo.deck_title ||
              deckData.title ||
              deckData.deck_title ||
              "Deck Matching Quiz",
            cards,
          });
        }
      } catch (err) {
        console.error("Error loading matching quiz:", err);
      }
    };

    loadMatchingData();
  }, [lessonId, deckId, isLessonMode, isDeckMode]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
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
        .map((item, index) => {
          const question =
            item.question ||
            item.front ||
            item.term ||
            item.prompt ||
            item.title ||
            "";

          const answer =
            item.answer ||
            item.back ||
            item.definition ||
            item.correct_answer ||
            item.correctAnswer ||
            item.description ||
            "";

          return {
            id: item.cardId || item.card_id || item.id || index + 1,
            question: cleanQuestionText(question),
            answer: cleanAnswerText(answer),
          };
        })
        .filter((item) => item.question && item.answer);
    } catch (error) {
      console.error("Invalid matching data:", error);
      return [];
    }
  }, [lesson]);

  const leftCards = useMemo(() => {
    return shuffleArray(
      matchingPairs.map((item) => ({
        id: item.id,
        text: item.question,
      }))
    );
  }, [matchingPairs]);

  const rightCards = useMemo(() => {
    return shuffleArray(
      matchingPairs.map((item) => ({
        id: item.id,
        text: item.answer,
      }))
    );
  }, [matchingPairs]);

  const progressCurrent =
    matchingPairs.length > 0
      ? Math.round((matchedIds.length / matchingPairs.length) * 100)
      : 0;

  const isWrongCard = (card, side) =>
    wrongPair.some((item) => item.id === card.id && item.side === side);

  const saveMatchingResult = (finalScore) => {
    const answers = matchingPairs.map((item) => ({
      question: item.question,
      userAnswer: item.answer,
      correctAnswer: item.answer,
      explanation: item.answer,
      isCorrect: true,
    }));

    localStorage.setItem(
      "lessonQuizResults",
      JSON.stringify({
        source: isDeckMode ? "deck" : "lesson",
        quizMode: "matching",
        lessonId: isLessonMode ? Number(lessonId) : null,
        deckId: isDeckMode ? Number(deckId) : null,
        score: finalScore,
        total: matchingPairs.length,
        answers,
      })
    );
  };

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
          saveMatchingResult(updated.length);

          setTimeout(() => {
            navigate(isDeckMode ? `/review/deck/${deckId}` : `/review/${lessonId}`);
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
                    window.speechSynthesis?.cancel();
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
            {lesson.title || "Matching Quiz"}
          </h1>


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