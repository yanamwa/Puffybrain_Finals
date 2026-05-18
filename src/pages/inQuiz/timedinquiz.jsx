import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./timedinquiz.module.css";

const timedFrames = [
  "/images/timed1.png",
  "/images/timed2.png",
  "/images/timed3.png",
];

export default function TimedQuiz() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [loading, setLoading] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [title, setTitle] = useState("Timed Quiz");
  const [questions, setQuestions] = useState([]);

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);

  const [time, setTime] = useState(() => {
    return Number(localStorage.getItem("timedQuizSeconds")) || 120;
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const finishedRef = useRef(false);

  function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  function cleanQuestionText(text = "") {
    return String(text).replace(/\s*A\..*/is, "").trim();
  }

  function cleanAnswer(text = "") {
    return String(text)
      .toLowerCase()
      .replace(/^[a-d]\.\s*/i, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractOptionsFromQuestion(questionText = "") {
    const optionMatches = [
      ...String(questionText).matchAll(
        /([A-D])\.\s*(.*?)(?=\s+[A-D]\.\s+|$)/gi
      ),
    ];

    return optionMatches.map((match) => match[2].trim()).filter(Boolean);
  }

  useEffect(() => {
    if (!loading) return;

    const animationSequence = [0, 1, 2, 0, 1, 2, 0, 1, 2];
    let currentFrame = 0;

    const interval = setInterval(() => {
      setFrameIndex(animationSequence[currentFrame]);
      currentFrame++;

      if (currentFrame >= animationSequence.length) {
        currentFrame = 0;
      }
    }, 220);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        if (isLessonMode) {
          const res = await fetch(
            `http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`
          );

          const lesson = await res.json();
          setTitle(lesson?.title || "Lesson Timed Quiz");

          let parsed = [];

          try {
            parsed = JSON.parse(lesson?.quiz_contents || "[]");
          } catch {
            parsed = [];
          }

          const lessonQuestions = parsed
            .map((item) => {
              const rawQuestion = item.question || "No question available.";

              const correctAnswer =
                item.correct_answer ||
                item.correctAnswer ||
                item.answer ||
                item.correct ||
                "";

              const extractedOptions = extractOptionsFromQuestion(rawQuestion);

              const rawOptions =
                extractedOptions.length > 0
                  ? extractedOptions
                  : [
                      ...(Array.isArray(item.options) ? item.options : []),
                      ...(Array.isArray(item.choices) ? item.choices : []),
                      item.option_a,
                      item.option_b,
                      item.option_c,
                      item.option_d,
                      item.choice_a,
                      item.choice_b,
                      item.choice_c,
                      item.choice_d,
                    ].filter(Boolean);

              const questionText = cleanQuestionText(rawQuestion);
              const answerText = String(correctAnswer).trim().toLowerCase();

              const isTrueFalse =
                answerText === "true" ||
                answerText === "false" ||
                questionText.toLowerCase().includes("true or false");

              const options = isTrueFalse
                ? ["True", "False"]
                : shuffleArray([...new Set([...rawOptions, correctAnswer])]);

              return {
                question: questionText,
                options: options.filter(Boolean).map(String),
                answer: String(correctAnswer),
                explanation: item.explanation || correctAnswer,
              };
            })
            .filter((item) => item.question && item.options.length > 0);

          setQuestions(shuffleArray(lessonQuestions));
        }

        if (isDeckMode) {
          const deckRes = await fetch(
            `http://localhost/puffybrain/getDeckById.php?deckId=${deckId}`,
            { credentials: "include" }
          );

          const deckData = await deckRes.json();

          const cardsRes = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`,
            { credentials: "include" }
          );

          const cardsData = await cardsRes.json();
          const cards = cardsData.success ? cardsData.cards || [] : [];

          setTitle(
            deckData?.deck?.title ||
              deckData?.deck?.deck_title ||
              cardsData?.deck?.title ||
              cardsData?.deck_title ||
              "Deck Timed Quiz"
          );

          const deckQuestions = cards
            .map((card) => {
              const rawQuestion = card.question || "";
              const correctAnswer = card.answer || "";

              const extractedOptions = extractOptionsFromQuestion(rawQuestion);
              const questionText = cleanQuestionText(rawQuestion);
              const answerText = String(correctAnswer).trim().toLowerCase();

              const isTrueFalse =
                answerText === "true" ||
                answerText === "false" ||
                questionText.toLowerCase().includes("true or false");

              let options = [];

              if (isTrueFalse) {
                options = ["True", "False"];
              } else if (extractedOptions.length > 0) {
                options = extractedOptions;
              } else {
                const otherAnswers = shuffleArray(
                  cards
                    .filter((c) => c.answer && c.answer !== correctAnswer)
                    .map((c) => c.answer)
                ).slice(0, 3);

                options = shuffleArray([correctAnswer, ...otherAnswers]);
              }

              return {
                question: questionText,
                options: options.filter(Boolean).map(String),
                answer: String(correctAnswer),
                explanation: correctAnswer,
              };
            })
            .filter((item) => item.question && item.options.length > 0);

          setQuestions(shuffleArray(deckQuestions));
        }
      } catch (error) {
        console.error("Error loading timed quiz:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, deckId, isLessonMode, isDeckMode]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (loading || questions.length === 0 || finishedRef.current) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz(score, userResults, "timeout");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length, score, userResults]);

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

  function handleAnswer(selectedAnswerValue) {
    const currentQuestion = questions[questionIndex];

    if (!currentQuestion || selectedAnswer !== null) return;

    window.speechSynthesis?.cancel();

    setSelectedAnswer(selectedAnswerValue);

    const isCorrect =
      cleanAnswer(selectedAnswerValue) === cleanAnswer(currentQuestion.answer);

    const newResult = {
      question: currentQuestion.question,
      userAnswer: selectedAnswerValue,
      correctAnswer: currentQuestion.answer,
      explanation: currentQuestion.explanation,
      isCorrect,
    };

    const updatedResults = [...userResults, newResult];
    const updatedScore = score + (isCorrect ? 1 : 0);

    setUserResults(updatedResults);
    setScore(updatedScore);

    setTimeout(() => {
      setSelectedAnswer(null);

      if (questionIndex + 1 < questions.length) {
        setQuestionIndex((prev) => prev + 1);
      } else {
        finishQuiz(updatedScore, updatedResults, "completed");
      }
    }, 500);
  }

  async function saveQuizAttempt(finalScore, finishReason) {
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
          quizMode: "timed",
          score: finalScore,
          total: questions.length,
          isTimedOut: finishReason === "timeout",
        }),
      });
    } catch (error) {
      console.error("Save attempt error:", error);
    }
  }

  async function finishQuiz(finalScore, finalResults, finishReason = "completed") {
    if (finishedRef.current) return;

    finishedRef.current = true;
    window.speechSynthesis?.cancel();

    await saveQuizAttempt(finalScore, finishReason);

    localStorage.setItem(
      "lessonQuizResults",
      JSON.stringify({
        source: isDeckMode ? "deck" : "lesson",
        quizMode: "timed",
        finishReason,
        isTimedOut: finishReason === "timeout",
        deckId: deckId ? Number(deckId) : null,
        lessonId: lessonId ? Number(lessonId) : null,
        score: finalScore,
        total: questions.length,
        answers: finalResults,
      })
    );

    localStorage.removeItem("timedQuizSeconds");

    navigate(isDeckMode ? `/review/deck/${deckId}` : `/review/${lessonId}`);
  }

  if (loading) {
    return (
      <div className={styles.introScreen}>
        <img
          src={timedFrames[frameIndex]}
          alt="Loading timed quiz"
          className={styles.timedLoadingImage}
        />
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className={styles.page}>No timed quiz questions available.</div>;
  }

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const progress = ((questionIndex + 1) / questions.length) * 100;

  const isWarningTime = time <= 30;
  const isDangerTime = time <= 10;

  const timerClass = `${styles.timer} ${
    isDangerTime
      ? styles.dangerTimer
      : isWarningTime
      ? styles.warningTimer
      : ""
  }`;

  return (
    <div className={styles.page}>
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
                    <span>Read questions and choices aloud</span>
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

      <div className={styles.quizHeader}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className={styles.subtitle}>
          Question {questionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className={styles.questionBox}>
        <div className={styles.timerBox}>
          <div className={timerClass}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <div className={styles.questionTextBox}>
          {ttsEnabled && (
            <button
              type="button"
              className={styles.audioIconBtn}
              onClick={() => speakText(questions[questionIndex].question)}
            >
              <i className="bx bx-volume-full"></i>
            </button>
          )}

          <p className={styles.question}>{questions[questionIndex].question}</p>
        </div>

        <div className={styles.options}>
          {questions[questionIndex].options.map((option, i) => (
            <button
              key={i}
              className={`${styles.option} ${
                selectedAnswer === option ? styles.selectedOption : ""
              }`}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              {ttsEnabled && (
                <span
                  className={styles.optionAudioIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(option);
                  }}
                >
                  <i className="bx bx-volume-full"></i>
                </span>
              )}

              <span>{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}