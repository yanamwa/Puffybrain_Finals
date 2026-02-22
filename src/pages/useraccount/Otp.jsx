import { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./login.module.css";

export default function Otp() {
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const OTP_DURATION = 300; // 5 minutes
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      Swal.fire("Session Expired", "Please sign up again.", "warning")
        .then(() => navigate("/signup"));
    }
  }, [email, navigate]);

  // ===== TIMER =====
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

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
    const otp = inputsRef.current.map(input => input.value).join("");

    if (otp.length !== 4) {
      Swal.fire("Incomplete Code", "Enter all 4 digits.", "error");
      return;
    }

    fetch("http://localhost/puffybrain/verify-otp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Swal.fire("Verified!", "Your account has been verified.", "success")
            .then(() => navigate("/login"));
        } else {
          Swal.fire("Invalid Code", data.message, "error");
        }
      })
      .catch(() => {
        Swal.fire("Server Error", "Could not verify OTP.", "error");
      });
  };

  // ===== RESEND OTP =====
  const handleResend = () => {
    setResending(true);

    fetch("http://localhost/puffybrain/resend-otp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Swal.fire("Sent!", "New verification code sent.", "success");
          setTimeLeft(OTP_DURATION);
          inputsRef.current.forEach(input => (input.value = ""));
        } else {
          Swal.fire("Error", data.message, "error");
        }
      })
      .finally(() => setResending(false));
  };

  return (
    <div className="wrapper">
      <section className="container">
        <div className="background"></div>

        <div className="signup-container">
          <div className="signup-card">
            <h2>Email Verification</h2>
            <p className="verify-subtext">
              Enter the 4-digit code sent to your email
            </p>


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

            <div className="otp-row">
              <span className="otp-timer">
                {timeLeft > 0
                  ? `Code expires in ${formatTime()}`
                  : "Code expired"}
              </span>

              <button
                className="resend-btn"
                disabled={timeLeft > 0 || resending}
                onClick={handleResend}
              >
                Resend
              </button>
            </div>
            <button className="verify-btn" onClick={handleSubmit}>
              Verify
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
