import styles from "./loginA.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        title: "Missing Information",
        text: "Please enter both username and password.",
      });
      return; 
    }

    try {
      const res = await fetch(
        "http://localhost/puffybrain/AdminLogin.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return valid JSON");
      }

      if (data.success) {
        localStorage.setItem("admin", JSON.stringify(data.admin));

        Swal.fire({
          imageUrl: "/images/success.png",
          imageWidth: 170,
          imageHeight: 170,
          title: "Successfully Logged In",
          text: data.message,
        }).then(() => {
          navigate("/admin/dashboard");
        });
      } else {
        Swal.fire({
          imageUrl: "/images/error.png",
          imageWidth: 170,
          imageHeight: 170,
          title: "Login Failed",
          text: data.message,
        });
      }
    } catch (err) {
      Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        title: "Server Error",
        text: err.message,
      });
      console.error(err);
    }
  };

  
  return (
    <div className={styles.wrapper}>
      <section className={styles.container}>
        <div className={styles.background}></div>

         <div className={styles.signupContainer}>
           <div className={styles.signupCard}>
            <h2>Admin Login</h2>

            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

            <button className={styles.loginBtn} onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminLogin;