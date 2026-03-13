import styles from "./login.module.css";
import { Link } from "react-router-dom";

function CantSign() {
  return (
    <div className={styles.wrapper}>
      <section className={styles.container}>
        <div className={styles.background}></div>

        {/* NAVBAR */}
        <div className={styles.navbar}>
          <div className={styles.logo}>
            <img src="/images/logo1.png" alt="Logo" />
          </div>

          <ul className={styles.navLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contactus">Contact Us</Link></li>
          </ul>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.startBtn}>
              Start Learning
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.signupContainer}>
          <div style={{display:"flex", gap:"40px"}}>

            {/* FORGOT USERNAME */}
            <Link to="/forgot-username" style={{textDecoration:"none"}}>
              <div className={styles.cantCard} style={{width:"280px", textAlign:"center"}}>
                <img
                  src="/images/ForgotUser.png"
                  alt="Forgot Username"
                  style={{width:"180px", marginBottom:"10px"}}
                />
                <h3
                style={{
                  fontSize: "26px",
                  color: "var(--font-color)",
                }}>Forgot username?</h3>
                <p 
                style={{
                  color:"#666",
                  fontSize:"18px",
                  }}>
                  Need help remembering? You can request a reminder be sent
                  to your linked email here.
                </p>
              </div>
            </Link>

            {/* FORGOT PASSWORD */}
            <Link to="/forgot" style={{textDecoration:"none"}}>
              <div className={styles.cantCard} style={{width:"280px", textAlign:"center"}}>
                <img
                  src="/images/ForgotPassword.png"
                  alt="Forgot Password"
                  style={{width:"180px", marginBottom:"10px"}}
                />
                  <h3
                  style={{
                  fontSize: "26px",
                  color: "var(--font-color)",
                }}> Forgot password?</h3>
              <p 
                style={{
                  color:"#666",
                  fontSize:"18px",
                  }}>
                  If you have forgotten your password you can reset it here.
                </p>
              </div>
            </Link>

          </div>
        </div>

      </section>
    </div>
  );
}

export default CantSign;