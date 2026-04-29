import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./lessonresult.module.css";

export default function LessonResult() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [results, setResults] = useState({
    score: 0,
    total: 0,
    answers: []
  });

  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem("lessonQuizResults"));

    if (savedResults) {
      setResults({
        score: savedResults.score || 0,
        total: savedResults.total || 0,
        answers: savedResults.answers || []
      });
    }
  }, []);

  const percentage =
    results.total > 0 ? Math.round((results.score / results.total) * 100) : 0;

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
        <h1>
          You Scored <span>{results.score}</span>/<span>{results.total}</span>
        </h1>

        <p className={styles.subtitle}>
          {percentage >= 70 ? "Great job!" : "Don't give up! Try again!"}
        </p>

        <div className={styles.feedbackBox}>
          <h2>{feedbackTitle}</h2>
          <p>{feedbackMessage}</p>
          <p className={styles.percentage}>Score Percentage: {percentage}%</p>
        </div>

        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <h3>Lesson Mastery</h3>
            <p>{masteryLevel}</p>
          </div>

          <div className={styles.summaryCard}>
            <h3>Recommended Action</h3>
            <p>{recommendation}</p>
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

      <div className={styles.reviewWrapper}>
        <div className={styles.reviewHeader}>Review the Answers</div>

        <div className={styles.reviewList}>
          {results.answers.length === 0 ? (
            <p className={styles.noAnswers}>
              No answers recorded. Make sure your quiz saves the result before
              going to this page.
            </p>
          ) : (
            results.answers.map((item, index) => {
              const question = item.question || "Question not available";
              const userAnswer =
                item.userAnswer || item.selectedAnswer || item.studentAnswer || "No answer";
              const correctAnswer =
                item.correctAnswer || item.answer || "Correct answer not available";
              const explanation =
                item.explanation || "No explanation available.";

              const isCorrect =
                String(userAnswer).trim().toLowerCase() ===
                String(correctAnswer).trim().toLowerCase();

              return (
                <div key={index} className={styles.reviewItem}>
                  <div className={styles.reviewQuestion}>
                    {index + 1}. {question}
                  </div>

                  <hr className={styles.reviewDivider} />

                  <div className={styles.reviewAnswer}>
                    <p>
                      Your Answer:{" "}
                      <span
                        className={
                          isCorrect ? styles.correctText : styles.wrongText
                        }
                      >
                        {userAnswer}
                      </span>
                    </p>

                    <p>
                      Correct Answer:{" "}
                      <span className={styles.correctText}>{correctAnswer}</span>
                    </p>

                    <p>Explanation: {explanation}</p>
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