import "./login.css";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE;


  const handleSignup = () => {
    // ===== VALIDATIONS =====
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

    // ===== SEND TO BACKEND =====
    fetch(`${API_BASE}/signup.php`, {
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
    <div className="wrapper">
      <section className="container">
        <div className="background"></div>

        {/* NAVBAR */}
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

        {/* SIGNUP CARD */}
        <div className="signup-container">
          <div className="signup-card">
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
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            <button className="login-btn" onClick={handleSignup}>
              Sign Up
            </button>

            <p className="terms-text">
              By signing up, you agree to Terms and Privacy policies
            </p>

            <p className="signin-text">
              Already have an account? <Link to="/login">Signin</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Signup;
