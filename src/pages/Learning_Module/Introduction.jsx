import styles from "./lesson.module.css";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Introduction() {
  const { lessonId } = useParams();
  const username = localStorage.getItem("username") || "user";
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data);
      })
      .catch((err) => console.error(err));
  }, [lessonId]);

  if (!lesson) {
    return <div>Loading lesson...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.ribbon}></div>

        <div className={styles.tabs}>
          <Link to={`/introduction/${lessonId}`}>
            <button className={styles.welcomeactive}>Introduction</button>
          </Link>

          <Link to={`/lesson/${lessonId}`}>
            <button className={styles.howitworks}>Lesson</button>
          </Link>

          <Link to={`/review/${lessonId}`}>
            <button className={styles.aboutyou}>Review</button>
          </Link>
        </div>

        <div className={styles.greets}>
          <h1 className={styles.hello}>Hi there, @{username}!</h1>

          <h2>{lesson.title}</h2>
          <div className={styles.lessonText}>
            {lesson.learning_objectives || "No learning objectives yet."}
          </div>

          <Link to={`/lesson/${lessonId}`}>
            <button className={styles.button}>Start Lesson</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Introduction;