import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./multiplechoice.module.css";

const multipleFrames = [
  "/images/multiple1.png",
  "/images/multiple2.png",
  "/images/multiple3.png",
];

export default function Quiz() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);

  const [title, setTitle] = useState("Multiple Choice");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState([]);

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);

  const shuffleArray = (array) => {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  };

  const cleanOptionText = (text = "") => {
    return String(text).replace(/^[A-D]\.\s*/i, "").trim();
  };

  const addLetterPrefix = (option, index) => {
    const letters = ["A", "B", "C", "D"];
    const text = String(option || "").trim();

    if (/^[A-D]\.\s*/i.test(text)) return text;

    return `${letters[index]}. ${text}`;
  };

  const splitQuestionAndOptions = (questionText = "") => {
    const text = String(questionText).trim();

    const match = text.match(/^(.*?)(?=\s+A\.\s+)/i);
    const questionOnly = match ? match[1].trim() : text;

    const optionMatches = [
      ...text.matchAll(/([A-D])\.\s*(.*?)(?=\s+[A-D]\.\s+|$)/gi),
    ];

    const extractedOptions = optionMatches.map((m) => m[2].trim());

    return {
      questionOnly,
      extractedOptions,
    };
  };

  const isSameText = (a, b) => {
    return cleanOptionText(a).toLowerCase() === cleanOptionText(b).toLowerCase();
  };

  const getUniqueOptions = (options) => {
    const seen = new Set();

    return options.filter((opt) => {
      const clean = cleanOptionText(opt).toLowerCase();

      if (!clean || seen.has(clean)) return false;

      seen.add(clean);
      return true;
    });
  };

  const generateWrongOptions = (correctAnswer, allCards) => {
    const otherAnswers = allCards
      .map((card) => cleanOptionText(card.answer || ""))
      .filter((answer) => answer.trim() !== "")
      .filter((answer) => !isSameText(answer, correctAnswer));

    let wrongOptions = shuffleArray(getUniqueOptions(otherAnswers)).slice(0, 3);

    if (wrongOptions.length < 3) {
      const fallbackOptions = [
        "All of the above",
        "None of the above",
        "Not applicable",
      ].filter((opt) => !isSameText(opt, correctAnswer));

      wrongOptions = getUniqueOptions([...wrongOptions, ...fallbackOptions]).slice(
        0,
        3
      );
    }

    return wrongOptions;
  };

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
            const rawQuestionText = item.question || "No question available.";

            const { questionOnly, extractedOptions } =
              splitQuestionAndOptions(rawQuestionText);

            const correctAnswer =
              item.correct_answer || item.correctAnswer || item.answer || "";

            const isTrueFalse =
              item.type === "true_false" ||
              String(rawQuestionText).toLowerCase().includes("true or false") ||
              ["true", "false"].includes(
                String(correctAnswer).trim().toLowerCase()
              );

            const rawOptions =
              Array.isArray(item.options) && item.options.length > 0
                ? item.options.filter((opt) => opt && String(opt).trim() !== "")
                : extractedOptions;

            const options = isTrueFalse
              ? ["True", "False"]
              : getUniqueOptions(rawOptions).slice(0, 4);

            return {
              q: questionOnly,
              options,
              correctAnswer,
              explanation: item.explanation || correctAnswer,
            };
          });

          setQuestions(shuffleArray(lessonQuestions));
        }

        if (isDeckMode) {
          const deckRes = await fetch(
            `http://localhost/puffybrain/getDeckById.php?deckId=${deckId}`,
            { credentials: "include" }
          );

          const deckData = await deckRes.json();

          const deckTitle =
            deckData?.deck?.title ||
            deckData?.deck?.deck_title ||
            deckData?.deck?.name ||
            deckData?.title ||
            deckData?.deck_title ||
            "Deck Quiz";

          setTitle(deckTitle);

          const cardsRes = await fetch(
            `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`,
            { credentials: "include" }
          );

          const cardsData = await cardsRes.json();
          const cards = cardsData.success ? cardsData.cards || [] : [];

          if (cards.length === 0) {
            setQuestions([]);
            return;
          }

          const deckQuestions = cards.map((card) => {
            const correctAnswer = card.answer || "No answer available.";
            const rawQuestionText = card.question || "No question available.";

            const { questionOnly, extractedOptions } =
              splitQuestionAndOptions(rawQuestionText);

            const answerText = String(correctAnswer).trim().toLowerCase();

            const isTrueFalseCard =
              answerText === "true" ||
              answerText === "false" ||
              String(rawQuestionText).toLowerCase().includes("true or false");

            let options = [];

            if (isTrueFalseCard) {
              options = ["True", "False"];
            } else if (extractedOptions.length > 0) {
              options = getUniqueOptions(extractedOptions);
            } else {
              options = shuffleArray(
                getUniqueOptions([
                  correctAnswer,
                  ...generateWrongOptions(correctAnswer, cards),
                ])
              ).slice(0, 4);
            }

            return {
              q: questionOnly,
              options,
              correctAnswer,
              explanation: correctAnswer,
            };
          });

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

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const question = questions[current];

  const cleanOptions = (question?.options || []).filter(
    (opt) => opt && String(opt).trim() !== ""
  );

  const questionText = String(question?.q || "").toLowerCase();

  const isTrueFalse =
    questionText.includes("true or false") ||
    cleanOptions.some((opt) =>
      ["true", "false"].includes(String(opt).trim().toLowerCase())
    );

  const visibleOptions = isTrueFalse
    ? ["True", "False"]
    : cleanOptions.slice(0, 4).map((opt, index) => addLetterPrefix(opt, index));

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

    const chosenAnswer = visibleOptions[index] || question.options[index] || "";
    const isCorrect = isSameText(chosenAnswer, question.correctAnswer);
    const newScore = score + (isCorrect ? 1 : 0);

    const newAnswer = {
      question: question.q,
      userAnswer: chosenAnswer,
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
        window.speechSynthesis?.cancel();
        return;
      }

      await saveQuizAttempt(newScore);

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

      window.speechSynthesis?.cancel();
      navigate(isDeckMode ? `/review/deck/${deckId}` : `/review/${lessonId}`);
    }, 700);
  }

  if (loading) {
    return (
      <div className={styles.introScreen}>
        <img
          src={multipleFrames[frameIndex]}
          alt="Generating Quiz"
          className={styles.multipleIntroImage}
        />

        <h1 className={styles.generatingTitle}>Generating Quiz...</h1>

        <p className={styles.generatingText}>
          Preparing your questions and answers
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h1>No quiz questions available.</h1>
      </div>
    );
  }

  const progressPercent = ((current + 1) / questions.length) * 100;

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

      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

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

        <p className={styles.subtitle}>
          Question {current + 1} of {questions.length}
        </p>
      </div>

      <div className={styles.questionBox}>
        <div className={styles.questionTextBox}>
          {ttsEnabled && (
            <button
              type="button"
              className={styles.audioIconBtn}
              onClick={() => speakText(question.q)}
            >
              <i className="bx bx-volume-full"></i>
            </button>
          )}

          <p className={styles.question}>{question.q}</p>
        </div>

        <div className={styles.options}>
          {visibleOptions.map((opt, i) => {
            const isSelected = selected === i;

            const optionClass = isSelected
              ? `${styles.option} ${styles.selected}`
              : styles.option;

            return (
              <button
                key={i}
                className={optionClass}
                onClick={() => handleAnswer(i)}
                disabled={locked}
              >
                {ttsEnabled && (
                  <span
                    className={styles.optionAudioIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(opt);
                    }}
                  >
                    <i className="bx bx-volume-full"></i>
                  </span>
                )}

                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}