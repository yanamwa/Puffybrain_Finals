import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../../config.js";
import { syncDeckCardMemorizationFromAnswers } from "../../utils/cardMemorization.js";
import styles from "./lessonresult.module.css";
import QuizModesModal from "../../components/QuizModesModal";

export default function LessonResult() {
  const navigate = useNavigate();
  const { lessonId, deckId } = useParams();

  const [results, setResults] = useState({
    score: 0,
    total: 0,
    answers: [],
  });

  const [attempts, setAttempts] = useState(0);
  const [source, setSource] = useState(deckId ? "deck" : "lesson");
  const [resultDeckId, setResultDeckId] = useState(deckId || null);

  const [quizMode, setQuizMode] = useState("");
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const fetchAttempts = async (savedResults) => {
    try {
      const query = new URLSearchParams({
        source: savedResults.source || (deckId ? "deck" : "lesson"),
        lessonId: savedResults.lessonId || savedResults.lesson_id || lessonId || "",
        deckId: savedResults.deckId || savedResults.deck_id || deckId || "",
        quizMode: savedResults.quizMode || savedResults.mode || "",
      });

      const res = await fetch(
        `${API_BASE}/getQuizAttempts.php?${query.toString()}`,
        { credentials: "include" }
      );

      const data = await res.json();

      setAttempts(data.success ? data.attempts || 0 : 0);
    } catch (error) {
      console.error("Fetch attempts error:", error);
      setAttempts(0);
    }
  };

  useEffect(() => {
    const parseStorage = (key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    };

    const savedResults =
      parseStorage(`lessonQuizResults_${lessonId}`) ||
      parseStorage("lessonQuizResults") ||
      parseStorage(`lessonQuizResult_${lessonId}`) ||
      parseStorage(`quizResults_${lessonId}`) ||
      parseStorage(`deckQuizResults_${deckId}`) ||
      parseStorage("quizResults");

    if (savedResults) {
      setResults({
        score: savedResults.score || 0,
        total: savedResults.total || 0,
        answers: savedResults.answers || [],
      });

      const detectedSource = savedResults.source || (deckId ? "deck" : "lesson");

      setSource(detectedSource);
      setResultDeckId(savedResults.deckId || savedResults.deck_id || deckId || null);
      setQuizMode(savedResults.quizMode || savedResults.mode || "");
      setIsTimedOut(Boolean(savedResults.isTimedOut || savedResults.timedOut));

      fetchAttempts(savedResults);
      syncDeckCardMemorizationFromAnswers(
        detectedSource === "deck",
        savedResults.answers || []
      );
    }
  }, [lessonId, deckId]);

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
      "You mastered this activity and showed strong understanding of the topic.";
    masteryLevel = "Outstanding (A)";
    recommendation =
      "You can continue to the next activity or try a more challenging quiz.";
  } else if (percentage >= 80) {
    feedbackTitle = "Very Good!";
    feedbackMessage =
      "You understood the topic very well with only minor mistakes.";
    masteryLevel = "Very Satisfactory (B+)";
    recommendation = "Review small mistakes and try another quiz mode.";
  } else if (percentage >= 70) {
    feedbackTitle = "Good Job!";
    feedbackMessage =
      "You understood most of the topic, but there are still areas to improve.";
    masteryLevel = "Satisfactory (B)";
    recommendation = "Review the missed questions before moving on.";
  } else if (percentage >= 60) {
    feedbackTitle = "Fair";
    feedbackMessage = "You have a basic understanding, but need more practice.";
    masteryLevel = "Developing (C)";
    recommendation = "Study again and retake the quiz.";
  } else if (percentage >= 50) {
    feedbackTitle = "Needs Improvement";
    feedbackMessage =
      "You are starting to understand, but more effort is needed.";
    masteryLevel = "Beginning (D)";
    recommendation = "Review carefully before retrying.";
  } else {
    feedbackTitle = "Needs Review";
    feedbackMessage =
      "You need to revisit the topic and build your understanding.";
    masteryLevel = "Below Basic (F)";
    recommendation = "Go back and focus on the key concepts.";
  }

  if (quizMode === "timed" && isTimedOut) {
    feedbackTitle = "Time Ran Out";
    feedbackMessage =
      "The timer ended before you finished the quiz. Your score is based only on the questions you answered before time ran out.";
    masteryLevel = "Incomplete";
    recommendation =
      "Try again and manage your time better, or review before retrying.";
  }

  const retryQuiz = () => {
    setShowQuizModal(true);
  };

  const goHome = () => {
    navigate("/homepage");
  };

  const goBack = () => {
    if (source === "deck") {
      navigate(`/deck/${resultDeckId || deckId}`);
    } else {
      navigate(`/learning/${lessonId}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.scoreSection}>
        <div className={styles.feedbackBox}>
          <div className={styles.scoreHeader}>
            <h1>
              You Scored <span>{results.score}</span>/
              <span>{results.total}</span>
            </h1>
          </div>

          {quizMode !== "timed" && (
            <p className={styles.percentage}>Score Percentage: {percentage}%</p>
          )}

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
            Practice Again
          </button>

          <button className={styles.lesson} onClick={goBack}>
            {source === "deck" ? "Back to Deck" : "Review Lesson"}
          </button>

          <button className={styles.home} onClick={goHome}>
            Go Home
          </button>
        </div>
      </div>

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
                  <p key={index}>✅ {item.question || "Question not available"}</p>
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
                      <span className={styles.correctAnswer}>
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

      {showQuizModal && (
        <QuizModesModal
          source={source}
          lessonId={source === "lesson" ? lessonId : undefined}
          deckId={source === "deck" ? resultDeckId || deckId : undefined}
          quizzes={results.answers}
          cards={results.answers}
          onClose={() => setShowQuizModal(false)}
        />
      )}
    </div>
  );
}
