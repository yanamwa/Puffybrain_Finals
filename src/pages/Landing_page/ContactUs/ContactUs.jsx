import React, { useEffect, useState } from "react";
import styles from "./ContactUs.module.css";
import Swal from "sweetalert2";
import { API_BASE } from "../../../config.js";
import LandingNavbar from "../../../components/LandingNavbar";
import LandingFooter from "../../../components/LandingFooter";

function ContactUs() {
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showAlert = ({ title, text, image }) => {
    Swal.fire({
      title,
      text,
      imageUrl: image,
      imageWidth: 200,
      imageHeight: 200,
      confirmButtonText: "Okay",
      confirmButtonColor: "#E3AADD",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sending) return;

    const form = e.currentTarget;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showAlert({
        title: "Missing Details",
        text: "Please fill out all fields.",
        image: "/images/think.png",
      });
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`${API_BASE}/sendContactMessage.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (data.success) {
        showAlert({
          title: "Message Sent!",
          text:
            data.message ||
            "Thank you for reaching out. We'll get back to you soon.",
          image: "/images/success.png",
        });

        form.reset();
      } else {
        showAlert({
          title:
            data.message === "You can only send 3 messages."
              ? "Message Limit Reached"
              : "Message Failed",
          text: data.message || "Please try again.",
          image: "/images/think.png",
        });
      }
    } catch (error) {
      console.error("CONTACT FORM ERROR:", error);

      showAlert({
        title: "Server Error",
        text: "Could not send your message.",
        image: "/images/error.png",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <header className={styles.header}>
        <LandingNavbar />

        <div className={styles.heroContent}>
          <div className={styles.headerText}>
            <h3>Contact Us</h3>

            <h1>
              Get in touch with us. We're always happy to hear your suggestions.
            </h1>

            <p>
              Have questions, suggestions, or feedback? We'd love to hear from
              you. Fill out the form below and our team will get back to you as
              soon as possible.
            </p>
          </div>

          <div className={styles.socials}>
            <i className="fa-brands fa-facebook-f"></i>
            <i className="fa-brands fa-instagram"></i>
            <i className="fa-brands fa-twitter"></i>
          </div>
        </div>
      </header>

      <section className={styles.contactSection}>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <p>Send a Message</p>
            <h2>Tell us what’s on your mind</h2>
          </div>

          <div className={styles.contactRow}>
            <div className={styles.contactField}>
              <label htmlFor="contact-name">Name:</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className={styles.contactField}>
              <label htmlFor="contact-email">Email:</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className={styles.messageField}>
            <label htmlFor="contact-message">Message:</label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="Enter your message"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={sending}
          >
            {sending ? "Sending..." : "Submit"}
          </button>
        </form>
      </section>

      <section className={styles.contactInfo}>
        <div className={styles.contactLeft}>
          <p>Contact Info</p>
          <h1>We are always happy to assist you</h1>
        </div>

        <div className={styles.contactRight}>
          <h2>Email Address</h2>
          <hr />
          <h2 className={styles.emailText}>
            puffybrain.contactus@gmail.com
          </h2>

          <h3>Assistance hours:</h3>
          <p>Monday - Friday</p>
          <p>6:00 AM - 8:00 PM EST</p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

export default ContactUs;