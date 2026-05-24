import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function LandingNavbar() {
  return (
    <header className={styles.navbar}>
      <NavLink to="/" className={styles.logo}>
        <img src="/images/logo1.png" alt="PuffyBrain" />
      </NavLink>

      <nav className={styles.navLinks}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/Landing/FAQ">FAQ</NavLink>
        <NavLink to="/contact">Contact Us</NavLink>
      </nav>

      <div className={styles.navActions}>
        <NavLink to="/signup" className={styles.startBtn}>
          Start Learning
        </NavLink>
      </div>
    </header>
  );
}