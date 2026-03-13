import { useState, useEffect, useRef } from "react";
import styles from "./qanda.module.css";

export default function QandA() {

const questions = [
  {
    q: "What is the primary purpose of a router in a home network?",
    answers: [
      "to forward data between the home network and the internet",
      "forward data between your home network and the internet"
    ]
  },
  {
    q: "Which network device is used to amplify a Wi-Fi signal to extend the coverage area of a wireless network?",
    answers: [
      "wi-fi repeater",
      "wifi repeater",
      "wi-fi extender",
      "wifi extender"
    ]
  },
  {
    q: "What does the acronym LAN commonly stand for?",
    answers: ["local area network"]
  }
];

const [current, setCurrent] = useState(0);
const [score, setScore] = useState(0);
const [inputValue, setInputValue] = useState("");
const [status, setStatus] = useState("");

const inputRef = useRef(null);

useEffect(() => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, [current]);

function checkAnswer() {

  const userAns = inputValue.trim().toLowerCase();
  const correctAnswers = questions[current].answers;

  const isCorrect = correctAnswers.some(
    ans => ans.toLowerCase() === userAns
  );

  if (isCorrect) {
    setStatus(styles.correct);
    setScore(score + 1);
  } else {
    setStatus(styles.wrong);
  }

  setTimeout(() => {
    nextQuestion();
  }, 500);
}

function nextQuestion() {

  if (current + 1 < questions.length) {
    setCurrent(current + 1);
    setInputValue("");
    setStatus("");
  } else {

    localStorage.setItem("score", score);
    window.location.href = "/result";
  }
}

function handleKeyDown(e) {
  if (e.key === "Enter") {
    checkAnswer();
  }
}

const progressWidth = ((current + 1) / questions.length) * 100;

return (
<div className={styles.wrapper}>

  <div className={styles.header}>

    <h1 className={styles.title}>Network Fundamentals</h1>

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

    <p className={styles.question}>
      {questions[current].q}
    </p>

    <div className={styles.typingContainer}>

      <input
        ref={inputRef}
        type="text"
        className={`${styles.input} ${status}`}
        placeholder="Type your answer"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />

    </div>

  </div>

</div>
);
}