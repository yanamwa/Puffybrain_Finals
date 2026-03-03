import styles from "./login.module.css";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        title: "Missing Fields",
        text: "Please enter username and password",
      });
      return;
    }

    fetch("http://localhost/puffybrain/login.php", {
      method: "POST",
      credentials: "include", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          Swal.fire({
            imageUrl: "/images/error.png",
            imageWidth: 170,
            imageHeight: 170,
            title: "Login Failed",
            text: data.message || "Invalid credentials",
          });
          return;
        }

        // Optional localStorage (NOT for auth, just UI)
        localStorage.setItem("user_email", data.email);
        localStorage.setItem("username", data.username);

        if (data.isNewUser) {
          Swal.fire({
            imageUrl: "/images/success.png",
            imageWidth: 170,
            imageHeight: 170,
            title: "Welcome!",
            text: "Let's get you started",
          }).then(() => navigate("/welcome"));
        } else {
          Swal.fire({
            imageUrl: "/images/success.png",
            imageWidth: 170,
            imageHeight: 170,
            title: "Welcome back!",
            text: "Redirecting to homepage",
          }).then(() => navigate("/homepage"));
        }
      })
      .catch(() => {
        Swal.fire("Error", "Server error", "error");
      });
  };

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
          </ul>

          <div className={styles.navActions}>
            <Link to="/signup" className={styles.startBtn}>
              Start Learning
            </Link>
          </div>
        </div>

        <div className={styles.signupContainer}>
          <div className={styles.signupCard}>
            <h2>Login</h2>

            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p className={styles.forgot}>
                <Link to="/forgot">Forgot your password?</Link>
              </p>

              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } ${styles.toggleEye}`}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <button className={styles.loginBtn} onClick={handleLogin}>
              Login
            </button>

            <p className={styles.signupText}>
              Don't have an account? <Link to="/signup">Signup</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;