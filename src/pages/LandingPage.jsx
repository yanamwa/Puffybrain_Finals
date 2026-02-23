import { useEffect } from "react";
import styles from "./LandingPage.module.css";

function LandingPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(`.${styles.fadeIn}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.show);
          } else {
            entry.target.classList.remove(styles.show);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <section className={styles.container}>

          <div className={styles.background}></div>

          <div className={styles.navbar}>
            <div className={styles.logo}>
              <img src="../images/logo1.png" alt="Logo" />
            </div>

            <nav className={styles.navLinks}>
              <li><a href="">Home</a></li>
              <li><a href="">About</a></li>
              <li><a href="">FAQ</a></li>
              <li><a href="">Contact Us</a></li>
            </nav>

            <div className={styles.navActions}>
              <a href="/login"
                className={styles.startBtn}
                style={{ textDecoration: 'none', display: 'inline-block' }}>
                Start Learning
              </a>
            </div>

          </div>

          <section className={styles.heroBg}>

            <div className={styles.heroContent}>
              <p className={styles.studySecret}>shhh… a study secret</p>

              <h1>Your quizzes are waiting<br />let's make your brain giggle!</h1>

              <p className={styles.sub}>Let's Puff Up Those Brain Cells!</p>

              <a href="/signup">
                <button className={styles.pressStart}>Press to Start</button>
              </a>
            </div>

          </section>
        </section>
      </div>

      <div className={styles.cloudContainer}>
        <img src="../images/clouds sa landing page.png" className={styles.cloudImg} alt="Clouds" />
      </div>

      <div className={styles.cloudBottomFade}></div>

      <section className={styles.features}>

        <div className={`${styles.feature} ${styles.fadeIn}`}>
          <img src="../images/card1.png" className={styles.frame} alt="Create study tools" />
          <div className={styles.text}>
            <h2>Create your own study tools</h2>
            <p>No more one–fits–all learning. PuffyBrain lets you design quizzes and flashcards for any subject, any topic, any time.</p>
          </div>
        </div>

        <div className={`${styles.feature} ${styles.reverse} ${styles.fadeIn}`}>
          <img src="../images/card2.png" className={styles.frame} alt="Master through practice" />
          <div className={styles.text}>
            <h2>Master through practice</h2>
            <p>Test yourself with the tools you create. Whether it's quick flashcards for memorization or full quizzes for deeper review, PuffyBrain helps you practice smarter and retain more.</p>
          </div>
        </div>

        <div className={`${styles.feature} ${styles.fadeIn}`}>
          <img src="../images/card3.png" className={styles.frame} alt="Stay organized" />
          <div className={styles.text}>
            <h2>Stay organized with decks</h2>
            <p>Keep your study materials neatly grouped into decks. Review them anytime, anywhere—perfect for exam prep, daily practice, or brushing up on specific topics.</p>
          </div>
        </div>
      </section>

      <section className={styles.library}>
        <img src="../images/background.jpg" className={styles.libraryBg} alt="Library background" />

        <div className={styles.libraryContent}>
          <h2>Ready to learn?</h2>

          <a href="/login">
            <button className={styles.startNow}>Start Now!</button>
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerMenu}>
          <a href="#">About Us</a>
          <a href="#">Terms and Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </div>

        <div className={styles.socialIcons}>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
          <a href="mailto:example@gmail.com"><i className="fas fa-envelope"></i></a>
        </div>
      </footer>

      <div className={styles.subFooter}>
        <p>© 2025 – PuffyBrain All Rights Reserved</p>
      </div>
    </>
  );
}

export default LandingPage;
