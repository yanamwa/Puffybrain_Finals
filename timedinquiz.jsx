import React, { useEffect, useState } from "react";
import "./timedinquiz.css";

export default function Quiz() {
  const [time, setTime] = useState(120);
  const [questionIndex, setQuestionIndex] = useState(0);

  const questions = [
    {
      question: "Which data structure uses FIFO?",
      options: ["Stack", "Queue", "Tree", "Graph"],
    },
    {
      question: "Which data structure uses LIFO?",
      options: ["Queue", "Array", "Stack", "Linked List"],
    },
    {
      question: "Which structure stores key-value pairs?",
      options: ["Hash Table", "Stack", "Queue", "Tree"],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const progress = ((questionIndex + 1) / questions.length) * 100;

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <h1 className="title">Data Structure</h1>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="subtitle">
          Question {questionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* TIMER */}
      <div className="timer-box">
        <div id="timer">
          {minutes} : {seconds.toString().padStart(2, "0")}
        </div>
      </div>

      {/* QUESTION */}
      <div className="question1">
        <p className="question">
          {questions[questionIndex].question}
        </p>

        {/* OPTIONS */}
       <div className="options">
      {questions[questionIndex].options.map((option, i) => (
      <button
      key={i}
      className="option"
      onClick={nextQuestion}
      >
      {option}
        </button>
          ))}
        </div>

        {/* TYPING */}
        <div
          id="typing-container"
          style={{ display: "none", marginTop: "40px" }}
        >
          <input
            type="text"
            id="typing-answer"
            placeholder="Type your answer"
            style={{
              padding: "10px 20px",
              width: "60%",
              fontSize: "18px",
              borderRadius: "15px",
              border: "1px solid #505152",
              marginLeft: "250px",
            }}
          />

          <button
            id="submit-typing"
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "18px",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}