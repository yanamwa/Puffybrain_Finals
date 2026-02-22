import "./login.module.css";
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
    <div className="wrapper">
      <section className="container">
        <div className="background"></div>

        <div className="navbar">
          <div className="logo">
            <img src="/images/logo.png" alt="Logo" />
          </div>

          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>

          <div className="nav-actions">
            <Link to="/signup" className="start-btn">
              Start Learning
            </Link>
          </div>
        </div>

        <div className="login-container">
          <div className="login-card">
            <h2>Login</h2>

            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p className="forgot">
                <a href="/forgot" style={{ color: "#A993D8" }}>
                  Forgot your password?
                </a>
              </p>

              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>

            <p className="signup-text">
              Don't have an account? <Link to="/signup">Signup</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;