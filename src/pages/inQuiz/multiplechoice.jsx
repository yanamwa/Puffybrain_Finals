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
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sttEnabled, setSttEnabled] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
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

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }

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

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

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

    const startSpeechToText = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech-to-text is not supported in this browser. Try Google Chrome.");
    setSttEnabled(false);
    return;
  }

  if (!question || locked) {
    setSttEnabled(false);
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("Listening...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
      .toLowerCase()
      .trim();

    console.log("Heard:", transcript);

    const spokenMap = [
      ["a", "option a", "letter a", "first", "first choice", "one", "1"],
      ["b", "option b", "letter b", "second", "second choice", "two", "2"],
      ["c", "option c", "letter c", "third", "third choice", "three", "3"],
      ["d", "option d", "letter d", "fourth", "fourth choice", "four", "4"],
    ];

    let matchedIndex = -1;

    for (let i = 0; i < visibleOptions.length; i++) {
      const commands = spokenMap[i] || [];

      if (commands.some((cmd) => transcript === cmd || transcript.includes(cmd))) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      matchedIndex = visibleOptions.findIndex((opt) => {
        const optionText = String(opt).toLowerCase().trim();
        return transcript.includes(optionText) || optionText.includes(transcript);
      });
    }

    if (matchedIndex !== -1) {
      const realIndex = question.options.indexOf(visibleOptions[matchedIndex]);
      handleAnswer(realIndex);
    } else {
      alert(`I heard: "${transcript}". Say "Option A", "Option B", "Option C", or "Option D".`);
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);

    if (event.error === "not-allowed") {
      alert("Microphone permission was blocked. Allow microphone access in your browser.");
    } else if (event.error === "no-speech") {
      alert("No speech detected. Try again and say Option A, B, C, or D.");
    } else {
      alert(`Speech error: ${event.error}`);
    }

    setSttEnabled(false);
  };

  recognition.onend = () => {
    setSttEnabled(false);
  };

  recognition.start();
};

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
            className={`${styles.switchBtn} ${ttsEnabled ? styles.switchOn : ""}`}
            onClick={() => {
              setTtsEnabled((prev) => !prev);
              window.speechSynthesis?.cancel();
            }}
          >
            {ttsEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingIcon}>🎤</div>
            <div className={styles.settingText}>
              <strong>Speech to Text</strong>
              <span>Answer using your microphone</span>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.switchBtn} ${sttEnabled ? styles.switchOn : ""}`}
onClick={() => {
  if (!sttEnabled) {
    setSttEnabled(true);
    startSpeechToText();
  } else {
    setSttEnabled(false);
  }
}}          >
            {sttEnabled ? "ON" : "OFF"}
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
    const newSpeed = Number(e.target.value);
    setVoiceSpeed(newSpeed);

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
            let optionClass = styles.option;

            const originalIndex = question.options.indexOf(opt);
            const isSelected = selected === originalIndex;

            const isCorrect =
              String(opt).trim().toLowerCase() ===
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
                onClick={() => handleAnswer(originalIndex)}
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