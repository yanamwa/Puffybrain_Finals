import React, { useEffect } from "react";
import styles from "./ContactUs.module.css";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

function ContactUs() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Message Sent!",
      text: "Thank you for reaching out. We'll get back to you soon 💌",
      confirmButtonText: "Okay",
      confirmButtonColor: "#E3AADD"
    });

    e.target.reset();
  };

  return (
    <div className={styles.contactPage}>

      <header className={styles.header}>

        <nav className={styles.navBox}>

          <div className={styles.navLeft}>
            <img src="/images/logo1.png" alt="logo" className={styles.logoImg}/>
          </div>

          <ul className={styles.navMenu}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>

          <div className={styles.navActions}>
            <Link to="/signup" className={styles.startBtn}>
              Start Learning
            </Link>
          </div>

        </nav>


        <div className={styles.headerText}>

          <h3>Contact Us</h3>

          <h1>
            Get in touch with us. We're always happy to hear your suggestions.
          </h1>

          <p>
            Have questions, suggestions, or feedback? We'd love to hear
            from you! Fill out the form below and our team will get back
            to you as soon as possible.
          </p>

        </div>


        <div className={styles.socials}>
          <i className="fa-brands fa-facebook-f"></i>
          <i className="fa-brands fa-instagram"></i>
          <i className="fa-brands fa-twitter"></i>
        </div>

      </header>


      <section className={styles.contactSection}>

        <form className={styles.contactForm} onSubmit={handleSubmit}>

          <div className={styles.contactRow}>

            <div className={styles.contactField}>
              <label>Name: </label>
              <input type="text" placeholder="Enter your name" required />
            </div>

            <div className={styles.contactField}>
              <label>Email: </label>
              <input type="email" placeholder="Enter your email" required />
            </div>

          </div>

          <label>Message </label>

          <textarea placeholder="Enter your message" required></textarea>

          <button className={styles.submitBtn}>
            Submit
          </button>

        </form>

      </section>


      <section className={styles.contactInfo}>

        <div className={styles.contactLeft}>
          <p>Contact Info</p>
          <h1>We are always happy to assist</h1>
          <h1>you</h1>
        </div>

        <div className={styles.contactRight}>

          <h2>Email Address</h2>

          <hr/>

          <h2>puffybrain.contactus@gmail.com</h2>

          <h3>Assistance hours:</h3>

          <p>Monday - Friday 6 am to</p>
          <p>8 pm EST</p>

        </div>

      </section>


      <footer className={styles.footer}>

        <div className={styles.footerMenu}>
          <Link to="/about">About Us</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className={styles.socialIcons}>
          <i className="fa-brands fa-instagram"></i>
          <i className="fa-brands fa-facebook-f"></i>
          <i className="fa-solid fa-envelope"></i>
        </div>

      </footer>

      <div className={styles.subFooter}>
        © 2025 – PuffyBrain All Rights Reserved
      </div>

    </div>
  );
}

export default ContactUs;