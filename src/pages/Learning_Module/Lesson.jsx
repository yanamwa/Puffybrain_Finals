import styles from "./lesson.module.css";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Lesson() {

  const { lessonId } = useParams(); // get id from URL
  const username = localStorage.getItem("username") || "user";

  const [lesson, setLesson] = useState(null);

  useEffect(() => {

    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then(res => res.json())
      .then(data => {
        setLesson(data);
      })
      .catch(err => console.error(err));

  }, [lessonId]);

  if (!lesson) {
    return <div>Loading lesson...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>

        <div className={styles.ribbon}></div>

        <div className={styles.tabs}>
          <button className={styles.welcomeactive}>Introduction</button>
          <button className={styles.howitworks}>Lesson</button>
          <button className={styles.aboutyou}>Review</button>
        </div>

        <div className={styles.greets}>

          <h1 className={styles.hello}>
            Hi there, @{username}!
          </h1>

          {/* Lesson Title from DB */}
          <h2>{lesson.title}</h2>

          {/* Lesson Description from DB */}
          <p className={styles.greeting1}>
            {lesson.description}
          </p>

          <Link to={`/learning/${lessonId}`}>
            <button className={styles.button}>
              Next
            </button>
          </Link>

        </div>

      </div>
    </div>
  );
}

export default Lesson;