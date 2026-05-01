import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./lessonresult.module.css";

export default function LessonResult() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [results, setResults] = useState({
    score: 0,
    total: 0,
    answers: [],
  });

  const [attempts, setAttempts] = useState(1);

  // 🔥 NEW: detect source (lesson or deck)
  const [source, setSource] = useState("lesson");
  const [deckId, setDeckId] = useState(null);

  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem("lessonQuizResults"));

    if (savedResults) {
      setResults({
        score: savedResults.score || 0,
        total: savedResults.total || 0,
        answers: savedResults.answers || [],
      });

      // 🔥 detect source
      setSource(savedResults.source || "lesson");
      setDeckId(savedResults.deckId || null);
    }

    const attemptKey = `lessonQuizAttempts_${lessonId || "default"}`;
    const previousAttempts = Number(localStorage.getItem(attemptKey)) || 0;
    const newAttempts = previousAttempts + 1;

    localStorage.setItem(attemptKey, newAttempts);
    setAttempts(newAttempts);
  }, [lessonId]);

  // 🔒 anti-copy
  useEffect(() => {
    const blockKeys = (e) => {
      const key = e.key.toLowerCase();

      if (
        (e.ctrlKey && ["c", "v", "x", "u", "s", "p"].includes(key)) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        alert("Copying or capturing this content is disabled.");
      }
    };

    const blockCopy = (e) => e.preventDefault();
    const blockContextMenu = (e) => e.preventDefault();

    document.addEventListener("keydown", blockKeys);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("paste", blockCopy);
    document.addEventListener("contextmenu", blockContextMenu);

    return () => {
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("paste", blockCopy);
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);

  const percentage =
    results.total > 0 ? Math.round((results.score / results.total) * 100) : 0;

  const correctAnswers = results.answers.filter((item) => item.isCorrect);
  const wrongAnswers = results.answers.filter((item) => !item.isCorrect);

  let feedbackTitle = "";
  let feedbackMessage = "";
  let masteryLevel = "";
  let recommendation = "";

  if (percentage >= 90) {
    feedbackTitle = "Excellent Performance!";
    feedbackMessage =
      "You mastered this lesson and showed strong understanding of the topic.";
    masteryLevel = "Outstanding (A)";
    recommendation =
      "You can continue to the next lesson or try a more challenging quiz.";

} else if (percentage >= 80) {
    feedbackTitle = "Very Good!";
    feedbackMessage =
      "You understood the lesson very well with only minor mistakes.";
    masteryLevel = "Very Satisfactory (B+)";
    recommendation =
      "Review small mistakes and proceed to the next lesson.";

} else if (percentage >= 70) {
  feedbackTitle = "Good Job!";
  feedbackMessage =
    "You understood most of the lesson, but there are still areas to improve.";
  masteryLevel = "Satisfactory (B)";
  recommendation =
    "Review the missed questions before moving on.";

} else if (percentage >= 60) {
  feedbackTitle = "Fair";
  feedbackMessage =
    "You have a basic understanding, but need more practice.";
  masteryLevel = "Developing (C)";
  recommendation =
    "Study again and retake the quiz.";

} else if (percentage >= 50) {
  feedbackTitle = "Needs Improvement";
  feedbackMessage =
    "You are starting to understand, but more effort is needed.";
  masteryLevel = "Beginning (D)";
  recommendation =
    "Review the lesson carefully before retrying.";

} else {
  feedbackTitle = "Needs Review";
  feedbackMessage =
    "You need to revisit the lesson and build your understanding.";
  masteryLevel = "Below Basic (F)";
  recommendation =
    "Go back to the lesson and focus on key concepts.";
}

  const retryQuiz = () => {
    localStorage.removeItem("lessonQuizResults");

    if (source === "deck") {
      navigate(`/deck/${deckId}`);
    } else {
      localStorage.setItem("startQuizMode", "true");
      navigate(`/learning/${lessonId}`);
    }
  };

  const goHome = () => {
    navigate("/homepage");
  };

  const goBack = () => {
    if (source === "deck") {
      navigate(`/deck/${deckId}`);
    } else {
      navigate(`/lesson/${lessonId}`);
    }
  };

  return (
  <div className={styles.wrapper}>
    <div className={styles.scoreSection}>
      <div className={styles.feedbackBox}>
        <div className={styles.scoreHeader}>
          <h1>
            You Scored <span>{results.score}</span>/<span>{results.total}</span>
          </h1>
          
        </div>
        <p className={styles.percentage}>Score Percentage: {percentage}%</p>
        <h2>{feedbackTitle}</h2>
        <p>{feedbackMessage}</p>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <h3>Your Status:</h3>
          <p>{masteryLevel}</p>
        </div>

        <div className={styles.summaryCard}>
          <h3>Recommended Action</h3>
          <p>{recommendation}</p>
        </div>

        <div className={styles.summaryCard}>
          <h3>Attempts</h3>
          <p>{attempts}</p>
        </div>
      </div>

      <div className={styles.resultButtons}>
        <button className={styles.retry} onClick={retryQuiz}>
          Practice?
        </button>

        <button className={styles.lesson} onClick={goBack}>
          {source === "deck" ? "Back to Deck" : "Review Lesson"}
        </button>

        <button className={styles.home} onClick={goHome}>
          Go Home
        </button>
      </div>
    </div>

    {/* Adaptive Feedback */}
    <div className={styles.reviewWrapper}>
      <div className={styles.reviewHeader}>Adaptive Feedback</div>

      <div className={styles.reviewList}>
        <div className={styles.reviewItem}>
          <div className={styles.reviewQuestion}>Strengths</div>
          <hr className={styles.reviewDivider} />

          <div className={styles.reviewAnswer}>
            {correctAnswers.length === 0 ? (
              <p>No strong areas detected yet.</p>
            ) : (
              correctAnswers.map((item, index) => (
                <p key={index}>
                  ✅ {item.question || "Question not available"}
                </p>
              ))
            )}
          </div>
        </div>

        <div className={styles.reviewItem}>
          <div className={styles.reviewQuestion}>Weaknesses</div>
          <hr className={styles.reviewDivider} />

          <div className={styles.reviewAnswer}>
            {wrongAnswers.length === 0 ? (
              <p>No weak areas detected. Great job!</p>
            ) : (
              wrongAnswers.map((item, index) => {
                const correctAnswer =
                  item.correctAnswer ||
                  item.answer ||
                  "Correct answer not available";

                const explanation =
                  item.explanation || "No explanation available.";

                return (
                  <div key={index} className={styles.weaknessItem}>
                    <p>❌ {item.question || "Question not available"}</p>

                    <p>
                      Correct Answer:{" "}
                      <span className={styles.correctText}>
                        {correctAnswer}
                      </span>
                    </p>

                    <p className={styles.explanationText}>
                      Explanation: {explanation}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Review Answers */}
    <div className={styles.reviewWrapper}>
      <div className={styles.reviewHeader}>Review the Answers</div>

      <div className={styles.reviewList}>
        {results.answers.length === 0 ? (
          <p className={styles.noAnswers}>No answers recorded.</p>
        ) : (
          results.answers.map((item, index) => {
            const question = item.question || "Question not available";

            const userAnswer =
              item.userAnswer || item.selectedAnswer || "No answer";

            const correctAnswer =
              item.correctAnswer ||
              item.answer ||
              "Correct answer not available";

            const isCorrect =
              item.isCorrect ??
              String(userAnswer).trim().toLowerCase() ===
                String(correctAnswer).trim().toLowerCase();

            return (
              <div key={index} className={styles.reviewItem}>
                <div className={styles.reviewQuestion}>
                  {index + 1}. {question}
                </div>

                <hr className={styles.reviewDivider} />

                <div className={styles.reviewAnswer}>
                  <p
                    className={
                      isCorrect ? styles.correctText : styles.wrongText
                    }
                  >
                    Your Answer: {userAnswer}
                  </p>

                  <p>
                    Correct Answer:{" "}
                    <span className={styles.correctText}>
                      {correctAnswer}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);
}