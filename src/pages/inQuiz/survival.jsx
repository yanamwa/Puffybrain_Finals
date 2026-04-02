import { useState } from "react";
import styles from "./survival.module.css";

export default function Survival() {

const questions = [
  {
    type: "mcq",
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
    type: "mcq",
    q: "Which device extends Wi-Fi coverage?",
    options: [
      "Network Switch",
      "Modem",
      "Wi-Fi Repeater/Extender",
      "Hub"
    ],
    correct: 2
  },
  {
    type: "typing",
    q: "What does the acronym LAN stand for?",
    answer: "local area network"
  },
  {
    type: "typing",
    q: "What is the primary function of a computer's CPU?",
    answer: "execute instructions and perform calculations"
  }
];

const [current, setCurrent] = useState(0);
const [score, setScore] = useState(0);
const [lives, setLives] = useState(3);
const [typingAnswer, setTypingAnswer] = useState("");

const question = questions[current];

function loseLife(){
  setLives(prev => {
    const newLives = prev - 1;

    if(newLives <= 0){
      localStorage.setItem("score", score);
      localStorage.setItem("outOfLives","true");
      window.location.href = "/Result";
    }

    return newLives;
  });
}

function nextQuestion(){
  if(current + 1 < questions.length){
    setCurrent(current + 1);
    setTypingAnswer("");
  } else {
    localStorage.setItem("score", score);
    window.location.href = "/Result";
  }
}

function handleMCQ(index){

  if(index === question.correct){
    setScore(score + 1);
  }else{
    loseLife();
  }

  setTimeout(nextQuestion,1000);
}

function handleTyping(){
  const userAns = typingAnswer.trim().toLowerCase();
  const correctAns = question.answer.toLowerCase();

  if(userAns === correctAns){
    setScore(score + 1);
  }else{
    loseLife();
  }

  nextQuestion();
}

const progress = ((current + 1) / questions.length) * 100;

return (
<div className={styles.page}>

  <div className={styles.header}>
    <h1 className={styles.title}>Network Fundamentals</h1>

    <div className={styles.progressContainer}>
      <div
        className={styles.progressBar}
        style={{width: `${progress}%`}}
      />
    </div>

    <p className={styles.subtitle}>
      Question {current + 1} of {questions.length}
    </p>
  </div>



  <div className={styles.questionBox}>
        <div className={styles.lives}>
        {[1,2,3].map((i) => (
            <img
            key={i}
            src=""
            className={`${styles.heart} ${lives < i ? styles.lost : ""}`}
            alt="life"
            />
        ))}
        </div>
    <p className={styles.question}>{question.q}</p>

    {question.type === "mcq" && (
      <div className={styles.options}>
        {question.options.map((opt,i)=>(
          <button
            key={i}
            className={styles.option}
            onClick={()=>handleMCQ(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    )}

    {question.type === "typing" && (
      <div className={styles.typingContainer}>
        <input
          className={styles.typingAnswer}
          type="text"
          placeholder="Type your answer"
          value={typingAnswer}
          onChange={(e)=>setTypingAnswer(e.target.value)}
        />

        <button
          className={styles.submitTyping}
          onClick={handleTyping}
        >
          Submit
        </button>
      </div>
    )}

  </div>

</div>
);
}