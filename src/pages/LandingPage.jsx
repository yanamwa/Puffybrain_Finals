import { useEffect } from "react";
import styles from "./LandingPage.module.css";

export default function LandingPage() {

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle("show", entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="wrapper">
        <section className="container">

          {/* Background */}
          <div className="background"></div>

          {/* NAVBAR */}
          <div className="navbar">
            <div className="logo">
              <img src="/images/logo.png" alt="Logo" />
            </div>

            <ul className="nav-links">
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>

            <div className="nav-actions">
              <a className="start-btn" href="/login">
                Start Learning
              </a>
            </div>
          </div>

          {/* HERO */}
          <section className="hero">
            <div className="hero-content">
              <p className="study-secret">shhh… a study secret</p>

              <h1>
                Your quizzes are waiting <br />
                let’s make your brain giggle!
              </h1>

              <p className="sub">Let’s Puff Up Those Brain Cells!</p>

              <a href="/login">
                <button className="press-start">Press to Start</button>
              </a>
            </div>
          </section>

        </section>
      </div>

      {/* CLOUDS */}
      <div className="cloud-container">
        <img
          src="/images/clouds sa landing page.png"
          className="cloud-img"
          alt="clouds"
        />
      </div>

      <div className="cloud-bottom-fade"></div>


      {/* FEATURES */}
      <section className="features">

        <div className="feature fade-in">
          <img src="/images/card1.png" className="frame" />
          <div className="text">
            <h2>Create your own study tools</h2>
            <p>
              No more one–fits–all learning. PuffyBrain lets you design quizzes
              and flashcards for any subject, any topic, any time.
            </p>
          </div>
        </div>

        <div className="feature reverse fade-in">
          <img src="/images/card2.png" className="frame" />
          <div className="text">
            <h2>Master through practice</h2>
            <p>
              Test yourself with the tools you create and retain more.
            </p>
          </div>
        </div>

        <div className="feature fade-in">
          <img src="/images/card3.png" className="frame" />
          <div className="text">
            <h2>Stay organized with decks</h2>
            <p>
              Keep your study materials neatly grouped into decks.
            </p>
          </div>
        </div>

      </section>

      {/* LIBRARY */}
      <section className="library">
        <img src="/images/background.jpg" className="library-bg" />

        <div className="library-content">
          <h2>Ready to learn?</h2>

          <a href="/login">
            <button className="start-now">Start Now!</button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-menu">
          <a href="#">About Us</a>
          <a href="#">Terms and Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </div>

        <div className="social-icons">
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
          <a href="mailto:example@gmail.com"><i className="fas fa-envelope"></i></a>
        </div>
      </footer>

      <div className="sub-footer">
        <p>© 2025 – PuffyBrain All Rights Reserved</p>
      </div>
    </>
  );
}
