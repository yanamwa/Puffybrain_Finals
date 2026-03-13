import React, { useState } from "react";
import styles from "./multiplechoice.module.css";

export default function Quiz() {

  const questions = [
    {
      q: "What is the primary purpose of a 'router' in a home network?",
      options: [
        "To connect all wired devices into a single network.",
        "To create a wireless Wi-Fi signal for devices.",
        "To forward data between your home network and the internet.",
        "To protect the network from viruses and unauthorized access."
      ],
      correct: 2
    },
    {
      q: "Which network device is used to amplify a Wi-Fi signal to extend coverage?",
      options: [
        "A Network Switch",
        "A Modem",
        "A Wi-Fi Repeater/Extender",
        "A Hub"
      ],
      correct: 2
    },
    {
      q: "What does the acronym 'LAN' commonly stand for?",
      options: [
        "Long-Area Network",
        "Local Access Node",
        "Linked Application Network",
        "Local Area Network"
      ],
      correct: 3
    }
  ];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  const question = questions[current];

  function handleAnswer(index) {
    if (locked) return;

    setSelected(index);
    setLocked(true);

    if (index === question.correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
        setLocked(false);
      } else {
        localStorage.setItem("score", score + (index === question.correct ? 1 : 0));
        window.location.href = "/result"; 
      }
    }, 1000);
  }

  const progressPercent = ((current + 1) / questions.length) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Network Fundamentals</h1>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className={styles.subtitle}>
          Question {current + 1} of {questions.length}
        </p>
      </div>

      <div className={styles.questionBox}>
        <p className={styles.question}>{question.q}</p>

        <div className={styles.options}>
          {question.options.map((opt, i) => {
            let optionClass = styles.option;

            if (selected !== null) {
              if (i === question.correct) {
                optionClass = `${styles.option} ${styles.correct}`;
              } else if (i === selected) {
                optionClass = `${styles.option} ${styles.wrong}`;
              }
            }

            return (
              <button
                key={i}
                className={optionClass}
                onClick={() => handleAnswer(i)}
                disabled={locked}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}