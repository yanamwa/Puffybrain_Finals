import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./login.css";

export default function Otp() {
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 email passed from Signup.jsx
  const email = location.state?.email;

  const handleInput = (e, index) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
    if (e.target.value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    const otp = inputsRef.current.map(i => i.value).join("");

    if (otp.length !== 4) {
      Swal.fire("Incomplete Code", "Enter all 4 digits.", "error");
      return;
    }

    if (!email) {
      Swal.fire("Error", "Email not found. Please sign up again.", "error");
      return;
    }

    // ✅ VERIFY WITH BACKEND
    fetch("http://localhost/puffybrain/verify-otp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Swal.fire(
            "Verified!",
            "Your account has been successfully verified.",
            "success"
          ).then(() => navigate("/login"));
        } else {
          Swal.fire("Invalid Code", data.message, "error");
        }
      })
      .catch(() => {
        Swal.fire("Server Error", "Could not verify OTP.", "error");
      });
  };

  return (
    <div className="wrapper">
      <section className="container">
        <div className="background"></div>

        <div className="signup-container">
          <div className="signup-card">
            <h2>Verification</h2>

            <div className="otp-wrapper">
              {[0, 1, 2, 3].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="otp-input"
                  ref={el => (inputsRef.current[index] = el)}
                  onInput={e => handleInput(e, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                />
              ))}
            </div>

            <button className="verify-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
