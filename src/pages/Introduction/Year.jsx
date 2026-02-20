import styles from "./Info.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Year() {
  const [year, setYear] = useState("");
  const navigate = useNavigate();
const handleSubmit = () => {
  const selectedYear = year || "Rather not say";
  const email = localStorage.getItem("user_email"); 
  console.log("EMAIL FROM STORAGE:", email); 
  if (!email) {
    Swal.fire("Error", "User not logged in", "error");
    return;
  }

  fetch("http://localhost/puffybrain/update-year.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      year_level: selectedYear
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        navigate("/profile");
      } else {
        Swal.fire("Error", data.message, "error");
      }
    });
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
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
            <option>Others</option>
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