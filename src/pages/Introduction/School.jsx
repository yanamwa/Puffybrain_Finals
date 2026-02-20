import styles from "./Info.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function School() {
  const [school, setSchool] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    const selectedSchool = school || "Rather not say";
    const email = localStorage.getItem("user_email");

    if (!email) {
      Swal.fire("Error", "User not identified. Please log in again.", "error");
      return;
    }

    fetch("http://localhost/puffybrain/update-school.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        school: selectedSchool
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigate("/year");
        } else {
          Swal.fire("Error", data.message, "error");
        }
      })
      .catch(() => {
        Swal.fire("Server Error", "Could not update school.", "error");
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
          <h1>Enter your school / university</h1>

          <select
            className={styles.schoolSelect}
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          >
            <option value="">Rather not say</option>
            <option>Cavite State University – Main Campus (Indang)</option>
            <option>Cavite State University – Imus Campus</option>
            <option>Cavite State University – Carmona Campus</option>
            <option>Cavite State University – Bacoor City Campus</option>
            <option>Cavite State University – Trece Martires City Campus</option>
            <option>Cavite State University – Tanza Campus</option>
            <option>Cavite State University – Silang Campus</option>
            <option>Cavite State University – Naic Campus</option>
            <option>Cavite State University – Rosario Campus</option>
            <option>Cavite State University – General Trias City Campus</option>
            <option>University of the Philippines System</option>
            <option>Polytechnic University of the Philippines</option>
            <option>De La Salle University</option>
            <option>University of Santo Tomas</option>
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

export default School;