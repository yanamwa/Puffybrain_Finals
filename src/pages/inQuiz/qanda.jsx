import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./qanda.module.css";

export default function QandA() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [lesson, setLesson] = useState(null);
  const [deckTitle, setDeckTitle] = useState("Deck Q&A");
  const [deckCards, setDeckCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("");
  const [userResults, setUserResults] = useState([]);

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifImage, setNotifImage] = useState("/images/correct_answer.png");

  const inputRef = useRef(null);

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
          const cardsRes = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`
          );
          const cardsData = await cardsRes.json();

          setDeckCards(cardsData.success ? cardsData.cards || [] : []);

          const titleFromCardsResponse =
            cardsData.deck?.title ||
            cardsData.deck_title ||
            cardsData.deckTitle ||
            cardsData.title ||
            cardsData.cards?.[0]?.deck_title ||
            cardsData.cards?.[0]?.deckTitle;

          if (titleFromCardsResponse) {
            setDeckTitle(titleFromCardsResponse);
          } else {
            const deckRes = await fetch(
              `http://localhost/puffybrain/getDeckById.php?id=${deckId}`
            );
            const deckData = await deckRes.json();

            setDeckTitle(
              deckData.deck?.title ||
                deckData.deck_title ||
                deckData.deckTitle ||
                deckData.title ||
                "Deck Q&A"
            );
          }
        }
      } catch (err) {
        console.error("Error loading Q&A:", err);
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

  const questions = useMemo(() => {
    if (isLessonMode && lesson?.quiz_contents) {
      try {
        const parsed = JSON.parse(lesson.quiz_contents);
        if (!Array.isArray(parsed)) return [];

        return shuffleArray(
          parsed.map((item) => ({
            q: item.question || "No question available.",
            correctAnswer:
              item.correct_answer || item.correctAnswer || item.answer || "",
            explanation: item.explanation || item.answer || "",
          }))
        );
      } catch {
        return [];
      }
    }

    if (isDeckMode) {
      return shuffleArray(
        deckCards.map((card) => ({
          q: card.question || "No question available.",
          correctAnswer: card.answer || "",
          explanation: card.answer || "",
        }))
      );
    }

    return [];
  }, [lesson, deckCards, isLessonMode, isDeckMode]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [current]);

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

  const cleanAnswer = (text) =>
    String(text)
      .toLowerCase()
      .replace(/`/g, "")
      .replace(/\bcant\b/g, "cannot")
      .replace(/\bcan't\b/g, "cannot")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const levenshtein = (a, b) => {
    const dp = Array.from({ length: a.length + 1 }, () =>
      Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }

    return dp[a.length][b.length];
  };

  const isCloseEnough = (userAnswer, correctAnswer) => {
    const userClean = cleanAnswer(userAnswer);
    const correctClean = cleanAnswer(correctAnswer);

    if (userClean === correctClean) return true;

    const distance = levenshtein(userClean, correctClean);
    const maxLength = Math.max(userClean.length, correctClean.length);

    return 1 - distance / maxLength >= 0.8;
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
          quizMode: "qna",
          score: finalScore,
          total: questions.length,
          isTimedOut: false,
        }),
      });
    } catch (error) {
      console.error("Save attempt error:", error);
    }
  }

  async function checkAnswer() {
    if (!questions[current] || notifOpen) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const isCorrect = isCloseEnough(
      inputValue,
      questions[current].correctAnswer
    );

    setNotifImage(
      isCorrect ? "/images/correct_answer.png" : "/images/wrong_answer.png"
    );
    setNotifOpen(true);

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
      setNotifOpen(false);
      nextQuestion(updatedScore, updatedResults);
    }, 1100);
  }

  async function nextQuestion(updatedScore, updatedResults) {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setInputValue("");
      setStatus("");
      return;
    }

    await saveQuizAttempt(updatedScore);

    localStorage.setItem(
      "lessonQuizResults",
      JSON.stringify({
        source: isDeckMode ? "deck" : "lesson",
        quizMode: "qna",
        deckId: deckId ? Number(deckId) : null,
        lessonId: lessonId ? Number(lessonId) : null,
        score: updatedScore,
        total: questions.length,
        answers: updatedResults,
      })
    );

    navigate(`/review/${lessonId || "deck"}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      checkAnswer();
    }
  }

  if (loading) return <div className={styles.wrapper}>Loading Q&A...</div>;

  if (questions.length === 0) {
    return <div className={styles.wrapper}>No Q&A questions available.</div>;
  }

  const progressWidth = ((current + 1) / questions.length) * 100;

  return (
    <div className={styles.wrapper}>
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
                    <span>Read questions aloud</span>
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

      <div className={styles.header}>
        <h1 className={styles.title}>
          {isLessonMode ? lesson?.title || "Lesson Q&A" : deckTitle}
        </h1>

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
        <div className={styles.questionRow}>
          {ttsEnabled && (
            <button
              type="button"
              className={styles.audioIconBtn}
              onClick={() => speakText(questions[current].q)}
            >
              <i className="bx bx-volume-full"></i>
            </button>
          )}

          <p className={styles.question}>{questions[current].q}</p>
        </div>

        <div className={styles.typingContainer}>
          <input
            ref={inputRef}
            type="text"
            className={`${styles.input} ${status}`}
            placeholder="Type your answer"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={notifOpen}
          />
        </div>
      </div>
    </div>
  );
}
