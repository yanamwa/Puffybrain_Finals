import styles from "./Info.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE } from "../../config.js";

function School() {
  const [school, setSchool] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const selectedSchool = school || "Rather not say";
    const email = localStorage.getItem("user_email");

    if (!email) {
      Swal.fire("Error", "User not identified. Please log in again.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/update-school.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          school: selectedSchool,
        }),
      });

      const text = await res.text();
      console.log("RAW SCHOOL RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (data.success) {
        navigate("/year");
      } else {
        Swal.fire("Error", data.message || "Could not update school.", "error");
      }
    } catch (error) {
      console.error("UPDATE SCHOOL ERROR:", error);
      Swal.fire("Server Error", "Could not update school.", "error");
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
          <h1>Enter your school / university</h1>

          <select
            className={styles.schoolSelect}
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          >
            <option value="">Rather not say</option>
            <option value="Cavite State University – Main Campus (Indang)">
              Cavite State University – Main Campus (Indang)
            </option>
            <option value="Cavite State University – Imus Campus">
              Cavite State University – Imus Campus
            </option>
            <option value="Cavite State University – Carmona Campus">
              Cavite State University – Carmona Campus
            </option>
            <option value="Cavite State University – Bacoor City Campus">
              Cavite State University – Bacoor City Campus
            </option>
            <option value="Cavite State University – Trece Martires City Campus">
              Cavite State University – Trece Martires City Campus
            </option>
            <option value="Cavite State University – Tanza Campus">
              Cavite State University – Tanza Campus
            </option>
            <option value="Cavite State University – Silang Campus">
              Cavite State University – Silang Campus
            </option>
            <option value="Cavite State University – Naic Campus">
              Cavite State University – Naic Campus
            </option>
            <option value="Cavite State University – Rosario Campus">
              Cavite State University – Rosario Campus
            </option>
            <option value="Cavite State University – General Trias City Campus">
              Cavite State University – General Trias City Campus
            </option>
            <option value="University of the Philippines System">
              University of the Philippines System
            </option>
            <option value="Polytechnic University of the Philippines">
              Polytechnic University of the Philippines
            </option>
            <option value="De La Salle University">
              De La Salle University
            </option>
            <option value="University of Santo Tomas">
              University of Santo Tomas
            </option>
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

export default School;