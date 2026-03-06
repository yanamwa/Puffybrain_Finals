import styles from './login.module.css';
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

const isPasswordValid = password.length >= 12;
const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  
const handleSubmit = (e) => {
  e.preventDefault();

  // Check password length (12 characters)
  if (!isPasswordValid) {
    Swal.fire({
      title: "Weak Password",
      text: "Password must be at least 12 characters.",
      imageUrl: "/images/error.png",
      imageWidth: 200,
      imageHeight: 200,
    });
    return;
  }

  // Check confirm password empty
  if (!confirmPassword) {
    Swal.fire({
      title: "Missing Field",
      text: "Please confirm your password.",
      imageUrl: "/images/error.png",
      imageWidth: 200,
      imageHeight: 200,
    });
    return;
  }

  // Check if passwords match
  if (!doPasswordsMatch) {
    Swal.fire({
      title: "Password Mismatch",
      text: "Passwords do not match.",
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
      Swal.fire({
        title: "Error",
        text: data.message,
        imageUrl: "/images/error.png",
        imageWidth: 200,
        imageHeight: 200,
      });
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
    <div className={styles.wrapper}>
      <section className={styles.container}>
        <div className={styles.background}></div>

          <div className={styles.signupContainer}>
            <div className={styles.signupCard}>
            <h2>Change Password</h2>

            <label>New Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } ${styles.toggleEye}`}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {password.length > 0 && (
              <div className={`${styles.validationMessage} ${isPasswordValid ? styles.success : styles.error}`}>
                {isPasswordValid
                  ? `✓ Password is strong (${password.length} characters)`
                  : `Password must be at least 12 characters (current: ${password.length})`}
              </div>
            )}

            <label>Confirm New Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                } ${styles.toggleEye}`}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {confirmPassword.length > 0 && (
              <div className={`${styles.validationMessage} ${doPasswordsMatch ? styles.success : styles.error}`}>
                {doPasswordsMatch
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </div>
            )}

            <button className={styles.loginBtn} onClick={handleSubmit}>
              Update Password
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChangePassword;
