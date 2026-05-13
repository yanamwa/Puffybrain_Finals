import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./realFlashcards.module.css";

export default function Flashcards() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [lesson, setLesson] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState([]);
  const [flipped, setFlipped] = useState(false);

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifImage, setNotifImage] = useState("/images/correct_answer.png");

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

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
        console.error("Error loading flashcards:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, deckId, isLessonMode, isDeckMode]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const flashcards = useMemo(() => {
    if (isLessonMode && lesson?.quiz_contents) {
      try {
        const parsed = JSON.parse(lesson.quiz_contents);
        if (!Array.isArray(parsed)) return [];

        return shuffleArray(
          parsed.map((item) => ({
            question: item.question || "No question available.",
            answer:
              item.correct_answer ||
              item.correctAnswer ||
              item.answer ||
              "No answer available.",
            explanation: item.explanation || "",
          }))
        );
      } catch {
        return [];
      }
    }

    if (isDeckMode) {
      return shuffleArray(
        deckCards.map((card) => ({
          question: card.question || "No question available.",
          answer: card.answer || "No answer available.",
          explanation: "",
        }))
      );
    }

    return [];
  }, [lesson, deckCards, isLessonMode, isDeckMode]);

  const currentCard = flashcards[currentIndex];

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
          quizMode: "flashcard",
          score: finalScore,
          total: flashcards.length,
          isTimedOut: false,
        }),
      });
    } catch (error) {
      console.error("Save flashcard attempt error:", error);
    }
  }

  const loadNextCard = async (difficulty) => {
    if (!currentCard || notifOpen) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const isCorrect = difficulty === "easy" || difficulty === "good";

    if (difficulty === "easy") {
      setNotifImage("/images/correct_answer.png");
    } else if (difficulty === "good") {
      setNotifImage("/images/good_answer.png");
    } else {
      setNotifImage("/images/wrong_answer.png");
    }

    setNotifOpen(true);

    const newResult = {
      question: currentCard.question,
      userAnswer: difficulty,
      correctAnswer: currentCard.answer,
      explanation: currentCard.explanation || currentCard.answer,
      isCorrect,
    };

    const updatedResults = [...userResults, newResult];
    const updatedScore = score + (isCorrect ? 1 : 0);

    setUserResults(updatedResults);
    setScore(updatedScore);

    setTimeout(async () => {
      setNotifOpen(false);

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setFlipped(false);
        return;
      }

      await saveQuizAttempt(updatedScore);

      localStorage.setItem(
        "lessonQuizResults",
        JSON.stringify({
          source: isDeckMode ? "deck" : "lesson",
          quizMode: "flashcard",
          deckId: deckId ? Number(deckId) : null,
          lessonId: lessonId ? Number(lessonId) : null,
          score: updatedScore,
          total: flashcards.length,
          answers: updatedResults,
        })
      );

      navigate(`/review/${lessonId || "deck"}`);
    }, 1100);
  };

  if (loading) {
    return <div className={styles.container}>Loading flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return <div className={styles.container}>No flashcards available.</div>;
  }

  return (
    <div className={styles.container}>
      {notifOpen && (
        <div className={styles.slideNotif}>
          <img
            src={notifImage}
            alt="Answer feedback"
            className={styles.notifImage}
          />
        </div>
      )}

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
                    <span>Read flashcards aloud</span>
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

      <div className={styles.flashcardInfo}>
        <h2 className={styles.deckTitle}>
          {isLessonMode
            ? lesson?.title || "Lesson Flashcards"
            : "Deck Flashcards"}
        </h2>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
            }}
          ></div>
        </div>

        <p className={styles.questionCount}>
          Question {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      <div className={styles.flashcardWrapper}>
        <div className={styles.tab}>
          <span className={!flipped ? styles.active : ""}>Question</span>
          <span onClick={() => setFlipped((prev) => !prev)}>Flip</span>
        </div>

        <div
          className={`${styles.flashcard} ${flipped ? styles.flipped : ""}`}
          onClick={() => setFlipped((prev) => !prev)}
        >
          <div className={styles.flashcardInner}>
            <div className={`${styles.flashcardFace} ${styles.front}`}>
              {ttsEnabled && (
                <button
                  type="button"
                  className={styles.audioIconBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentCard.question);
                  }}
                >
                  <i className="bx bx-volume-full"></i>
                </button>
              )}

              <p>{currentCard.question}</p>
            </div>

            <div className={`${styles.flashcardFace} ${styles.back}`}>
              {ttsEnabled && (
                <button
                  type="button"
                  className={styles.audioIconBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentCard.answer);
                  }}
                >
                  <i className="bx bx-volume-full"></i>
                </button>
              )}

              <p>{currentCard.answer}</p>
            </div>
          </div>

          <div className={styles.difficulty}>
            <button
              className={styles.easy}
              disabled={notifOpen}
              onClick={(e) => {
                e.stopPropagation();
                loadNextCard("easy");
              }}
            >
              Easy
            </button>

            <button
              className={styles.good}
              disabled={notifOpen}
              onClick={(e) => {
                e.stopPropagation();
                loadNextCard("good");
              }}
            >
              Good
            </button>

            <button
              className={styles.hard}
              disabled={notifOpen}
              onClick={(e) => {
                e.stopPropagation();
                loadNextCard("hard");
              }}
            >
              Hard
            </button>
          </div>

          <p className={styles.difficultyHint}>
            Easy = mastered • Good = understood • Hard = needs review
          </p>
        </div>
      </div>
    </div>
  );
}
