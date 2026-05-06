import React, { useEffect, useState } from "react";
import styles from "./timedquiz.module.css";
import { useNavigate, useParams } from "react-router-dom";

export default function TimedQuiz() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [time, setTime] = useState(120);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [score, setScore] = useState(0);
  const { lessonId, deckId } = useParams();
  const isLessonMode = Boolean(lessonId);
  const isDeckMode = Boolean(deckId);
  const navigate = useNavigate();
  const hasSource = isLessonMode || isDeckMode;
  
  const previewSlides = [  
    {
      question: "Which of these is not an access modifier?",
      options: [
        { text: "Protected", className: "" },
        { text: "Private", className: "wrong" },
        { text: "Public", className: "" },
        { text: "Package", className: "" },
      ],
    },
    {
      question: "Which of these is not an access modifier?",
      options: [
        { text: "Protected", className: "correct" },
        { text: "Private", className: "" },
        { text: "Public", className: "" },
        { text: "Package", className: "" },
      ],
    },
    {
      question: "Which of these is not an access modifier?",
      options: [
        { text: "Protected", className: "" },
        { text: "Private", className: "" },
        { text: "Public", className: "" },
        { text: "Package", className: "" },
      ],
    },
  ];

  const questions = [
    {
      question: "Which data structure uses FIFO?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      answer: "Queue",
    },
    {
      question: "Which data structure uses LIFO?",
      options: ["Queue", "Array", "Stack", "Linked List"],
      answer: "Stack",
    },
    {
      question: "Which structure stores key-value pairs?",
      options: ["Hash Table", "Stack", "Queue", "Tree"],
      answer: "Hash Table",
    },
  ];

  useEffect(() => {
    if (started) return;

    const slide = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % previewSlides.length);
    }, 2500);

    return () => clearInterval(slide);
  }, [started]);

  useEffect(() => {
    if (!started || finished) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished]);

 const handleStart = () => {
  if (isLessonMode) {
    navigate(`/timedquiz/lesson/${lessonId}`);
    return;
  }

  if (isDeckMode) {
    navigate(`/timedquiz/deck/${deckId}`);
    return;
  }
};

  const nextQuestion = (selected) => {
    if (selected === questions[questionIndex].answer) {
      setScore((prev) => prev + 1);
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const restartQuiz = () => {
    setStarted(false);
    setFinished(false);
    setTime(120);
    setQuestionIndex(0);
    setScore(0);
    setPreviewIndex(0);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const progress = ((questionIndex + 1) / questions.length) * 100;

  const isWarningTime = time <= 30;
  const isDangerTime = time <= 10;

  const timerClass = `${styles.timer} ${
    isDangerTime ? styles.dangerTimer : isWarningTime ? styles.warningTimer : ""
  }`;

  if (!started) {
    return (
      <div className={styles.page}>
        <div className={styles.headerBox}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>Timed Quiz</h1>
          </div>

          <div className={styles.subtitles}>
            <p className={styles.subtitle}>Beat the clock!</p>
            <p className={styles.subtitle}>
              Answer as many questions as you can before time runs out. Think
              fast and stay sharp, every second counts!
            </p>
          </div>

        {hasSource && (
          <button className={styles.startBtn} onClick={handleStart}>
              Start
            </button>
          )}
        </div>

        <div className={styles.slideshowBox}>
          <div className={styles.timerBox}>
            <div className={timerClass}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>

          <p className={styles.question}>
            {previewSlides[previewIndex].question}
          </p>

          <div className={styles.previewOptions}>
            {previewSlides[previewIndex].options.map((option, i) => (
              <button
                key={i}
                className={`${styles.option} ${
                  option.className === "correct"
                    ? styles.correct
                    : option.className === "wrong"
                    ? styles.wrong
                    : ""
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          <div className={styles.dots}>
            {previewSlides.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${
                  previewIndex === i ? styles.activeDot : ""
                }`}
              ></span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className={styles.page}>
        <div className={styles.resultContainer}>
          <div className={styles.scoreContainer}>
            You Scored {score}/{questions.length}
            <p>
              {score === questions.length
                ? "Perfect Score!"
                : score >= 2
                ? "Great Job!"
                : "Keep Practicing!"}
            </p>
          </div>

          <div className={styles.buttonsContainer}>
            <button className={styles.tryAgain} onClick={restartQuiz}>
              Try Again
            </button>

            <button className={styles.goHome} onClick={restartQuiz}>
              Go Home
            </button>
          </div>

          <div className={styles.reviewContainer}>
            <div className={styles.headerBox}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>Review the Answers</h1>
              </div>
            </div>

            {questions.map((item, index) => (
              <div key={index} className={styles.reviewItem}>
                <strong>{item.question}</strong>
                {item.answer}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.quizHeader}>
        <h1 className={styles.title}>Data Structure</h1>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          ></div>
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

        <p className={styles.question}>{questions[questionIndex].question}</p>

        <div className={styles.options}>
          {questions[questionIndex].options.map((option, i) => (
            <button
              key={i}
              className={styles.option}
              onClick={() => nextQuestion(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}