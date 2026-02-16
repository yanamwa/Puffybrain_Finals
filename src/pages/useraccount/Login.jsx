import "./login.css";
import { useState } from "react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
          </ul>

          <div className="nav-actions">
            <a href="/signup" className="start-btn">Start Learning</a>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="login-container">
          <div className="login-card">
            <h2>Login</h2>

            <label>Username</label>
            <input type="text" placeholder="Enter your username" />

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            <a className="forgot" href="/forgot-password">
              Forget password?
            </a>

            <button className="login-btn">Login</button>

            <p className="signup-text">
              Don't have an account? <a href="/signup">Signup</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
