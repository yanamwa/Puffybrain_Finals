import styles from "./lesson.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config.js";

function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState([]);
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);

  const quizResultKey = `lessonQuizResults_${lessonId}`;

  useEffect(() => {
    fetch(`${API_BASE}/getLessonsById.php?id=${lessonId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Lesson API:", data);

        if (data.success) {
          setLesson(data.lesson);
        } else {
          console.error(data.message);
          setLesson(null);
        }
      })
      .catch((err) => console.error(err));
  }, [lessonId]);

  const lessonSlides = useMemo(() => {
    if (!lesson?.lesson_content) return [];

    const raw = String(lesson.lesson_content).trim();

    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed.map((page, index) => ({
          title: page.title || `Lesson Page ${index + 1}`,
          content: page.content || "",
        }));
      }
    } catch {
      return raw
        .split("---")
        .map((slide, index) => ({
          title: `Lesson Page ${index + 1}`,
          content: slide.trim(),
        }))
        .filter((slide) => slide.content.length > 0);
    }

    return [];
  }, [lesson]);

  const quizSlides = useMemo(() => {
    if (!lesson?.quiz_contents) return [];

    try {
      const parsed = JSON.parse(lesson.quiz_contents || "[]");

      if (!Array.isArray(parsed)) return [];

      return parsed.map((item, index) => ({
        id: item.id ?? index + 1,
        question: String(item.question || "").trim(),
        options: Array.isArray(item.options) ? item.options.filter(Boolean) : [],
        correct_answer: String(
          item.correct_answer || item.correctAnswer || item.answer || ""
        ).trim(),
        explanation: String(item.explanation || "").trim(),
      }));
    } catch (error) {
      console.error("Invalid quiz JSON:", error);
      return [];
    }
  }, [lesson]);

  const allSlides = useMemo(() => {
    const combined = [];
    let quizIndex = 0;

    lessonSlides.forEach((slide, index) => {
      combined.push({
        type: "lesson",
        content: slide,
      });

      if ((index + 1) % 2 === 0 && quizIndex < quizSlides.length) {
        combined.push({
          type: "quiz",
          content: quizSlides[quizIndex],
        });

        quizIndex++;
      }
    });

    while (quizIndex < quizSlides.length) {
      combined.push({
        type: "quiz",
        content: quizSlides[quizIndex],
      });

      quizIndex++;
    }

    return combined;
  }, [lessonSlides, quizSlides]);

  useEffect(() => {
    if (allSlides.length === 0) return;

    const savedResults =
      localStorage.getItem(quizResultKey) ||
      localStorage.getItem("lessonQuizResults");

    if (!savedResults) {
      setHasTakenQuiz(false);
      setQuizResults([]);
      setSelectedAnswers({});
      return;
    }

    try {
      const parsed = JSON.parse(savedResults);

      if (Number(parsed.lessonId) !== Number(lessonId)) {
        setHasTakenQuiz(false);
        setQuizResults([]);
        setSelectedAnswers({});
        return;
      }

      const savedAnswers = Array.isArray(parsed.answers) ? parsed.answers : [];

      setHasTakenQuiz(true);
      setQuizResults(savedAnswers);

      const restoredAnswers = {};

      allSlides.forEach((slide, index) => {
        if (slide.type !== "quiz") return;

        const savedAnswer = savedAnswers.find(
          (item) => item.question === slide.content.question
        );

        if (savedAnswer) {
          restoredAnswers[index] = savedAnswer.userAnswer;
        }
      });

      setSelectedAnswers(restoredAnswers);
    } catch {
      setHasTakenQuiz(false);
      setQuizResults([]);
      setSelectedAnswers({});
    }
  }, [quizResultKey, allSlides, lessonId]);

  const totalSlides = allSlides.length;

  const progressPercent = useMemo(() => {
    if (totalSlides === 0) return 0;
    return Math.round(((currentSlide + 1) / totalSlides) * 100);
  }, [currentSlide, totalSlides]);

  const currentItem = allSlides[currentSlide];
  const selectedAnswer = selectedAnswers[currentSlide];

  const saveProgress = async (slideIndexToSave) => {
    const studiedSlides = slideIndexToSave + 1;

    try {
      await fetch(`${API_BASE}/saveLessonProgress.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_id: Number(lessonId),
          total_cards: totalSlides,
          studied_cards: studiedSlides,
          last_viewed_card: studiedSlides,
        }),
      });
    } catch (error) {
      console.error("Error saving lesson progress:", error);
    }
  };

  const goBackToLearning = () => {
    navigate(`/learning/${lessonId}`);
  };

  const saveLessonResultsAndGoReview = async (latestResults = quizResults) => {
    const finalScore = latestResults.filter((item) => item.isCorrect).length;

    const finalResult = {
      source: "lesson",
      lessonId: Number(lessonId),
      deckId: null,
      quizMode: "lesson",
      isTimedOut: false,
      score: finalScore,
      total: latestResults.length,
      answers: latestResults,
    };

    localStorage.setItem(quizResultKey, JSON.stringify(finalResult));
    localStorage.setItem("lessonQuizResults", JSON.stringify(finalResult));

    localStorage.setItem(
      `lessonProgress_${lessonId}`,
      JSON.stringify({
        total_cards: totalSlides,
        studied_cards: totalSlides,
        progress_percent: 100,
        last_viewed_card: totalSlides,
      })
    );

    setHasTakenQuiz(true);

    await saveProgress(totalSlides - 1);
    navigate(`/review/${lessonId}`);
  };

  const handleOptionSelect = async (slideIndex, option) => {
    if (hasTakenQuiz || selectedAnswers[slideIndex]) return;

    const quiz = currentItem?.content;
    const correctAnswer = quiz?.correct_answer || "";
    const explanation = quiz?.explanation || "No explanation available.";

    const isCorrect =
      String(option).trim().toLowerCase() ===
      String(correctAnswer).trim().toLowerCase();

    setSelectedAnswers((prev) => ({
      ...prev,
      [slideIndex]: option,
    }));

    const newResult = {
      question: quiz?.question || "Question not available",
      userAnswer: option,
      correctAnswer,
      explanation,
      isCorrect,
    };

    const updatedResults = [
      ...quizResults.filter((item) => item.question !== newResult.question),
      newResult,
    ];

    setQuizResults(updatedResults);

    await Swal.fire({
      icon: isCorrect ? "success" : "error",
      title: isCorrect ? "Correct!" : "Incorrect!",
      html: `
        <div class="quiz-popup-content">
          <p class="quiz-popup-answer">
            <strong>Correct Answer:</strong><br />
            <span class="quiz-answer-value">${correctAnswer}</span>
          </p>

          ${
            explanation
              ? `<p class="quiz-popup-explanation">
                  <strong>Explanation:</strong><br />
                  ${explanation}
                </p>`
              : ""
          }
        </div>
      `,
      confirmButtonText: "Continue",
      allowOutsideClick: false,
      buttonsStyling: false,
      customClass: {
        popup: isCorrect
          ? "quiz-popup quiz-popup-correct"
          : "quiz-popup quiz-popup-incorrect",
        title: "quiz-popup-title",
        confirmButton: "quiz-popup-button",
        icon: "quiz-popup-icon",
      },
    });

    const nextSlide = slideIndex + 1;

    if (nextSlide < totalSlides) {
      await saveProgress(nextSlide);
      setCurrentSlide(nextSlide);
    } else {
      await saveLessonResultsAndGoReview(updatedResults);
    }
  };

  const handleNext = async () => {
    const nextSlide = currentSlide + 1;

    if (
      currentItem?.type === "quiz" &&
      !selectedAnswers[currentSlide] &&
      !hasTakenQuiz
    ) {
      Swal.fire({
        icon: "warning",
        title: "Answer first",
        text: "Please answer the quick check before continuing.",
      });
      return;
    }

    if (nextSlide < totalSlides) {
      await saveProgress(nextSlide);
      setCurrentSlide(nextSlide);
      return;
    }

    if (hasTakenQuiz) {
      await saveProgress(totalSlides - 1);
      goBackToLearning();
      return;
    }

    await saveLessonResultsAndGoReview();
  };

  const handlePrevious = async () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      await saveProgress(prevSlide);
      setCurrentSlide(prevSlide);
    }
  };

  if (!lesson) {
    return <div>Loading lesson...</div>;
  }

  const hasOptions =
    currentItem?.type === "quiz" &&
    Array.isArray(currentItem?.content?.options) &&
    currentItem.content.options.length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.ribbon}></div>

        <div className={styles.tabs}>
          <button className={styles.welcome} type="button" disabled>
            Introduction
          </button>

          <button className={styles.howitworksactive} type="button" disabled>
            Lesson
          </button>

          <button className={styles.aboutyou} type="button" disabled>
            Review
          </button>
        </div>

        <div className={styles.greets}>
          <h2>{lesson.title}</h2>

          <h3>
            Slide {totalSlides > 0 ? currentSlide + 1 : 0} of {totalSlides}
          </h3>

          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <p className={styles.progressText}>{progressPercent}% Complete</p>
          </div>

          <div className={styles.lessonText}>
            {!currentItem && "No lesson content yet."}

            {currentItem?.type === "lesson" && (
              <div className={styles.lessonSlide}>
                <h3 className={styles.lessonSlideTitle}>
                  {currentItem.content.title}
                </h3>

                <p className={styles.lessonSlideContent}>
                  {currentItem.content.content}
                </p>
              </div>
            )}

            {currentItem?.type === "quiz" && (
              <div className={styles.quizSlide}>
                <h4 className={styles.quizTitle}>Quick Check</h4>

                <p className={styles.quizQuestion}>
                  {currentItem.content.question || "No question available."}
                </p>

                {hasTakenQuiz && (
                  <p className={styles.noOptions}>
                    You already answered this quiz.
                  </p>
                )}

                {hasOptions ? (
                  <div className={styles.optionsContainer}>
                    {currentItem.content.options.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`${styles.optionButton} ${
                          selectedAnswer === option ? styles.selectedOption : ""
                        }`}
                        onClick={() => handleOptionSelect(currentSlide, option)}
                        disabled={hasTakenQuiz || Boolean(selectedAnswer)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noOptions}>
                    No options available for this quiz.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={styles.navButtons}>
            <button
              className={styles.button}
              onClick={handlePrevious}
              disabled={currentSlide === 0}
            >
              Previous
            </button>

            <button className={styles.button} onClick={handleNext}>
              {currentSlide === totalSlides - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lesson;