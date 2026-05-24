import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function LandingFooter() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerMenu}>
          <a href="/about">About Us</a>
          <a href="/terms">Terms and Conditions</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/contact">Contact Us</a>
        </div>

        <div className={styles.socialIcons}>
          <a href="#">
            <FaInstagram />
          </a>

          <a href="#">
            <FaFacebookF />
          </a>

          <a href="mailto:puffybrain@gmail.com">
            <FaEnvelope />
          </a>
        </div>
      </footer>

      <div className={styles.subFooter}>
        <p>© 2025 – PuffyBrain All Rights Reserved</p>
      </div>
    </>
  );
}