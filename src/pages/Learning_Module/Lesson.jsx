import styles from "./lesson.module.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";

function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState([]);

  useEffect(() => {
    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data);
      })
      .catch((err) => console.error(err));
  }, [lessonId]);

  const lessonSlides = useMemo(() => {
    if (!lesson?.lesson_content) return [];

    return lesson.lesson_content
      .split("---")
      .map((slide) => slide.trim())
      .filter((slide) => slide.length > 0);
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
        explanation: String(item.explanation || "").trim()
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
        content: slide
      });

      if ((index + 1) % 2 === 0 && quizIndex < quizSlides.length) {
        combined.push({
          type: "quiz",
          content: quizSlides[quizIndex]
        });
        quizIndex++;
      }
    });

    while (quizIndex < quizSlides.length) {
      combined.push({
        type: "quiz",
        content: quizSlides[quizIndex]
      });
      quizIndex++;
    }

    return combined;
  }, [lessonSlides, quizSlides]);

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
        await fetch("http://localhost/puffybrain/saveLessonProgress.php", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            lesson_id: Number(lessonId),
            total_cards: totalSlides,
            studied_cards: studiedSlides,
            last_viewed_card: studiedSlides
          })
        });
    } catch (error) {
      console.error("Error saving lesson progress:", error);
    }
  };

 const saveLessonResultsAndGoReview = async (latestResults = quizResults) => {
  const finalScore = latestResults.filter((item) => item.isCorrect).length;

  localStorage.setItem(
    "lessonQuizResults",
    JSON.stringify({
      lessonId: Number(lessonId),
      score: finalScore,
      total: latestResults.length,
      answers: latestResults
    })
  );

  localStorage.setItem(
    `lessonProgress_${lessonId}`,
    JSON.stringify({
      total_cards: totalSlides,
      studied_cards: totalSlides,
      progress_percent: 100,
      last_viewed_card: totalSlides
    })
  );

  await saveProgress(totalSlides - 1);

  navigate(`/review/${lessonId}`);
};
  const handleOptionSelect = async (slideIndex, option) => {
    if (selectedAnswers[slideIndex]) return;

    const quiz = currentItem?.content;
    const correctAnswer = quiz?.correct_answer || "";
    const explanation = quiz?.explanation || "No explanation available.";

    const isCorrect =
      String(option).trim().toLowerCase() ===
      String(correctAnswer).trim().toLowerCase();

    setSelectedAnswers((prev) => ({
      ...prev,
      [slideIndex]: option
    }));

    const newResult = {
      question: quiz?.question || "Question not available",
      userAnswer: option,
      correctAnswer: correctAnswer,
      explanation: explanation,
      isCorrect: isCorrect
    };

    const updatedResults = [
      ...quizResults.filter((item) => item.question !== newResult.question),
      newResult
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
        icon: "quiz-popup-icon"
      }
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

    if (currentItem?.type === "quiz" && !selectedAnswers[currentSlide]) {
      Swal.fire({
        icon: "warning",
        title: "Answer first",
        text: "Please answer the quick check before continuing."
      });
      return;
    }

    if (nextSlide < totalSlides) {
      await saveProgress(nextSlide);
      setCurrentSlide(nextSlide);
    } else {
      await saveLessonResultsAndGoReview();
    }
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
          <Link to={`/introduction/${lessonId}`}>
            <button className={styles.welcome}>Introduction</button>
          </Link>

          <Link to={`/lesson/${lessonId}`}>
            <button className={styles.howitworksactive}>Lesson</button>
          </Link>

          <button
            className={styles.aboutyou}
            type="button"
            onClick={() => saveLessonResultsAndGoReview()}
          >
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
              <div className={styles.lessonSlide}>{currentItem.content}</div>
            )}

            {currentItem?.type === "quiz" && (
              <div className={styles.quizSlide}>
                <h4 className={styles.quizTitle}>Quick Check</h4>

                <p className={styles.quizQuestion}>
                  {currentItem.content.question || "No question available."}
                </p>

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