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

  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem("lessonQuizResults"));

    if (savedResults) {
      setResults({
        score: savedResults.score || 0,
        total: savedResults.total || 0,
        answers: savedResults.answers || [],
      });
    }

    const attemptKey = `lessonQuizAttempts_${lessonId || "default"}`;
    const previousAttempts = Number(localStorage.getItem(attemptKey)) || 0;
    const newAttempts = previousAttempts + 1;

    localStorage.setItem(attemptKey, newAttempts);
    setAttempts(newAttempts);
  }, [lessonId]);

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
    masteryLevel = "Advanced Mastery";
    recommendation = "You can continue to the next lesson or try a harder quiz.";

  } else if (percentage >= 70) {
    feedbackTitle = "Good Job!";
    feedbackMessage =
      "You understood most of the lesson, but there are still a few areas to review.";
    masteryLevel = "Good Mastery";
    recommendation = "Review the missed questions before moving on.";

  } else if (percentage >= 50) {
    feedbackTitle = "Keep Practicing!";
    feedbackMessage =
      "You have some understanding, but you need more practice to strengthen your learning.";
    masteryLevel = "Developing Mastery";
    recommendation = "Study the lesson again, then retry the quiz.";

  } else {
    feedbackTitle = "Needs Review";
    feedbackMessage =
      "You may need to study the lesson again before trying another quiz.";
    masteryLevel = "Beginning Mastery";
    recommendation = "Go back to the lesson and focus on the difficult parts.";
  }

    const retryQuiz = () => {
      localStorage.removeItem("lessonQuizResults");
      localStorage.setItem("startQuizMode", "true");
      navigate(`/learning/${lessonId}`);
    };

  const goHome = () => {
    navigate("/homepage");
  };

  const goBackToLesson = () => {
    navigate(`/lesson/${lessonId}`);
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

        <button className={styles.lesson} onClick={goBackToLesson}>
          Review Lesson
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