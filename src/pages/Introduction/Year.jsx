import styles from "./Info.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config.js";
import Swal from "sweetalert2";

function Year() {
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const selectedYear = year || "Rather not say";
    const email = localStorage.getItem("user_email");

    console.log("EMAIL FROM STORAGE:", email);

    if (!email) {
      Swal.fire("Error", "User not logged in", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/update-year.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          year_level: selectedYear,
        }),
      });

      const text = await res.text();
      console.log("RAW YEAR RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response");
      }

      if (data.success) {
        navigate("/profile");
      } else {
        Swal.fire(
          "Error",
          data.message || "Could not update year level.",
          "error"
        );
      }
    } catch (error) {
      console.error("UPDATE YEAR ERROR:", error);

      Swal.fire(
        "Server Error",
        "Could not update year level.",
        "error"
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.notebook}>
        <div className={styles.tabs}>
          <div className={styles.tab}>welcome</div>
          <div className={styles.tab}>how-it-works</div>
          <div className={`${styles.tab} ${styles.active}`}>about-you</div>
        </div>

        <div className={styles.bookmark}></div>

        <div className={styles.page}>
          <h1>Enter your year level</h1>

          <select
            className={styles.schoolSelect}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Rather not say</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="Others">Others</option>
          </select>

          <button className={styles.submitBtn} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Year;