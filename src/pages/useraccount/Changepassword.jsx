import "./login.module.css";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

function ChangePassword() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const token = searchParams.get("token");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);

const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      Swal.fire({
        title: "Weak Password",
        text: "Password must be at least 6 characters.",
        imageUrl: "/images/error.png",
        imageWidth: 200,
        imageHeight: 200,
      });
      return;
    }

    fetch("http://localhost/puffybrain/change-password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          Swal.fire("Error", data.message, "error");
          return;
        }

        Swal.fire({
          title: "Success!",
          text: "Your password has been updated.",
          imageUrl: "/images/3.png",
          imageWidth: 200,
          imageHeight: 200,
        }).then(() => navigate("/login"));
      })
      .catch(() => {
        Swal.fire("Server Error", "Please try again later.", "error");
      });
  };

  return (
    <div className="wrapper">
      <section className="container">
        <div className="background"></div>

        <div className="login-container">
          <div className="login-card">
            <h2>Change Password</h2>

            <label>New Password</label>
            <div className="password-wrapper">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <i
                className={`fa-solid ${
                showPassword ? "fa-eye-slash" : "fa-eye"
                } toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
            />
            </div>

            <label>Confirm New Password</label>
            <div className="password-wrapper">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <i
                className={`fa-solid ${
                showPassword ? "fa-eye-slash" : "fa-eye"
                } toggle-eye`}
                onClick={() => setShowPassword(!showPassword)}
            />
            </div>

            <button className="login-btn" onClick={handleSubmit}>
              Update Password
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChangePassword;