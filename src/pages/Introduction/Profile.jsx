import styles from "./Profile.module.css";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config.js";

function Profile() {
  const [user, setUser] = useState(null);

  const handleStart = async () => {
    const email = localStorage.getItem("user_email");

    if (!email) {
      Swal.fire("Error", "User not logged in", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/complete-onboarding.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/Loading";
      } else {
        Swal.fire("Error", data.message || "Could not complete onboarding.", "error");
      }
    } catch (error) {
      Swal.fire("Server Error", "Could not complete onboarding.", "error");
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("user_email");

    if (!email) {
      Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 180,
        imageHeight: 180,
        title: "Not Logged In",
        text: "Please log in first.",
      });
      return;
    }

    fetch(`${API_BASE}/get-profile.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          Swal.fire("Error", data.message || "Could not load profile.", "error");
        }
      })
      .catch(() => {
        Swal.fire("Server Error", "Could not load profile.", "error");
      });
  }, []);

  if (!user) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Great!</h1>
        <h2 className={styles.subtitle}>You’re all set!</h2>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.photo}>
          <img src="/images/fri.jpg" alt="Profile" />
          <div className={styles.barcode}></div>
        </div>

        <div className={styles.idDetails}>
          <h3 className={styles.idTitle}>Student ID Card</h3>

          <p className={styles.info}>
            Username: {user.username}
            <span className={styles.year}>
              Year: {user.year_level || "Rather not say"}
            </span>
          </p>

          <p className={styles.info}>
            School: {user.school || "Rather not say"}
          </p>

          <p className={styles.info}>
            Signature:
            <span className={styles.signature}>{user.username}</span>
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <h2 className={styles.footerTitle}>Have fun learning!</h2>

        <button onClick={handleStart} className={styles.submitBtn}>
          Start
        </button>
      </div>
    </div>
  );
}

export default Profile;