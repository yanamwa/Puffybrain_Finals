import styles from './login.module.css';
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordValid = password.length >= 12;
  
  const handleSignup = () => {
    // 
    if (!username.trim()) {
      return Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 180,
        imageHeight: 180,
        title: "Username Required",
        text: "Please enter your username.",
      });
    }

    if (!email.trim()) {
      return Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        title: "Email Required",
        text: "Please enter your email.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
    }

    if (!password.trim()) {
      return Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        title: "Password Required",
        text: "Please enter your password.",
      });
    }

    if (password.length < 12) {
      return Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        title: "Password Too Short",
        text: "Your password must be at least 12 characters long.",
      });
    }

    fetch("http://localhost/puffybrain/signup.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then(async (res) => {
        const text = await res.text();

        try {
          return JSON.parse(text);
        } catch {
          throw new Error("Invalid response from server");
        }
      })
      .then((data) => {
        if (data.success) {
          Swal.fire({
             imageUrl: "/images/success.png",
        imageWidth: 170,
        imageHeight: 170,
            title: "Verify Your Email",
            text: data.message,
          }).then(() => {
            navigate("/otp", { state: { email } });
          });
        } else {
          Swal.fire({
             imageUrl: "/images/error.png",
            imageWidth: 170,
            imageHeight: 170,
            title: "Signup Failed",
            text: data.message,
          });
        }
      })
      .catch((err) => {
        Swal.fire({
            imageUrl: "/images/error.png",
            imageWidth: 170,
            imageHeight: 170,
          title: "Server Error",
          text: err.message,
        });
      });
  };

 return (
    <div className={styles.wrapper}>
      <section className={styles.container}>
      <div className={styles.background}
            ></div>

        <div className={styles.navbar}>
          <div className={styles.logo}>
            <img src="/images/logo1.png" alt="Logo" />
          </div>

          <ul className={styles.navLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>

          <div className={styles.navActions}>
            <Link to="/signup" className={styles.startBtn}>
              Start Learning
            </Link>
          </div>
        </div>

        <div className={styles.signupContainer}>
          <div className={styles.signupCard}>
            <h2>Create an Account</h2>

            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } ${styles.toggleEye}`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

                  {password.length > 0 && (
                          <div className={`${styles.validationMessage} ${isPasswordValid ? styles.success : styles.error}`}>
                            {isPasswordValid
                              ? `✓ Password is strong (${password.length} characters)`
                              : `Password must be at least 12 characters (current: ${password.length})`}
                          </div>
                        )}
            

            <button className={styles.loginBtn} onClick={handleSignup}>
              Sign Up
            </button>

            <p className={styles.termsText}>
              By signing up, you agree to Terms and Privacy policies
            </p>

            <p className={styles.signinText}>
              Already have an account? <Link to="/login">Signin</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Signup;
