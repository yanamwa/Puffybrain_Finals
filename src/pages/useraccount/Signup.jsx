import styles from "./login.module.css";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../../config.js";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const hasLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const isPasswordValid =
    hasLength && hasUpper && hasLower && hasNumber && hasSymbol;

  const passwordsMatch = password === confirmPassword;

  const showError = (title, text) => {
    Swal.fire({
      imageUrl: "/images/error.png",
      imageWidth: 170,
      imageHeight: 170,
      title,
      text,
    });
  };

  const handleSignup = async () => {
    if (isSigningUp) return;

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) {
      return showError("Username Required", "Please enter your username.");
    }

    if (!cleanEmail) {
      return showError("Email Required", "Please enter your email.");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return showError("Invalid Email", "Please enter a valid email address.");
    }

    if (!password.trim()) {
      return showError("Password Required", "Please enter your password.");
    }

    if (!isPasswordValid) {
      return showError(
        "Weak Password",
        "Password must meet all security requirements."
      );
    }

    if (!confirmPassword.trim()) {
      return showError(
        "Confirm Password Required",
        "Please confirm your password."
      );
    }

    if (!passwordsMatch) {
      return showError("Password Mismatch", "Passwords do not match.");
    }

    try {
      setIsSigningUp(true);

      const res = await fetch(`${API_BASE}/signup.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid response from server");
      }

      if (data.success) {
        Swal.fire({
          imageUrl: "/images/success.png",
          imageWidth: 170,
          imageHeight: 170,
          title: "Verify Your Email",
          text: data.message,
        }).then(() => {
        sessionStorage.setItem("otp_email", cleanEmail);
        navigate("/otp");
        });
      } else {
        showError("Signup Failed", data.message || "Unable to create account.");
      }
    } catch (err) {
      showError("Server Error", err.message);
    } finally {
      setIsSigningUp(false);
    }
  };

  const getPasswordStrength = (value) => {
    let strength = 0;

    if (value.length >= 12) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^A-Za-z0-9]/.test(value)) strength++;

    if (strength <= 2) return "weak";
    if (strength <= 4) return "medium";
    return "strong";
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className={styles.wrapper}>
      <section className={styles.container}>
        <div className={styles.background}></div>

        <div className={styles.navbar}>
          <div className={styles.logo}>
            <img src="/images/logo1.png" alt="Logo" />
          </div>

          <ul className={styles.navLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/faq">Contact Us</Link></li>
          </ul>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.startBtn}>
              Start Learning
            </Link>
          </div>
        </div>

        <div className={styles.signupContainer}>
          <div className={styles.signupCard} style={{ marginTop: "50px" }}>
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
              type="email"
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
              <div className={styles.passwordChecklist}>
                <p className={hasLength ? styles.valid : styles.invalid}>
                  {hasLength ? "✓" : "✗"} At least 12 characters
                </p>
                <p className={hasUpper ? styles.valid : styles.invalid}>
                  {hasUpper ? "✓" : "✗"} Has uppercase letter
                </p>
                <p className={hasLower ? styles.valid : styles.invalid}>
                  {hasLower ? "✓" : "✗"} Has lowercase letter
                </p>
                <p className={hasNumber ? styles.valid : styles.invalid}>
                  {hasNumber ? "✓" : "✗"} Has number
                </p>
                <p className={hasSymbol ? styles.valid : styles.invalid}>
                  {hasSymbol ? "✓" : "✗"} Has special character
                </p>
              </div>
            )}

            {password.length > 0 && (
              <div
                className={`${styles.validationMessage} ${
                  passwordStrength === "strong"
                    ? styles.success
                    : passwordStrength === "medium"
                    ? styles.warning
                    : styles.error
                }`}
              >
                {passwordStrength === "weak" && "Weak password"}
                {passwordStrength === "medium" && "Medium strength password"}
                {passwordStrength === "strong" && "✓ Strong password"}
              </div>
            )}

            <label>Confirm Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <i
                className={`fa-solid ${
                  showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                } ${styles.toggleEye}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              ></i>
            </div>

            {confirmPassword.length > 0 && (
              <div
                className={`${styles.validationMessage} ${
                  passwordsMatch ? styles.success : styles.error
                }`}
              >
                {passwordsMatch ? "✓ Passwords match" : "Passwords do not match"}
              </div>
            )}

            <button
              className={styles.loginBtn}
              onClick={handleSignup}
              disabled={isSigningUp}
            >
              {isSigningUp ? "Signing Up..." : "Sign Up"}
            </button>

            <p className={styles.termsText}>
              By signing up, you agree to Terms and Privacy policies
            </p>

            <p className={styles.signinText}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Signup;