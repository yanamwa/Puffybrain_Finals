import { useState, useRef } from "react";
import Swal from "sweetalert2";
import { API_BASE } from "../../config.js";
import styles from "./Addnewcard.module.css";

export default function AddNewCard({ deckId, onCardAdded }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageName, setImageName] = useState(""); 
  const fileRef = useRef(null);

const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImage(file);
  setImageName(file.name);
  setPreview(URL.createObjectURL(file));
};

const removeImage = () => {
  setImage(null);
  setPreview("");
  setImageName("");

  if (imageInputRef.current) {
    imageInputRef.current.value = "";
  }
};

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setPreview(null);
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAdd = async () => {
    if (!deckId) {
      Swal.fire({
        title: "Missing deck",
        text: "Deck ID is missing.",
        icon: "error",
        customClass: { container: styles.swalAbove },
      });
      return;
    }

    if (!question.trim() || !answer.trim()) {
      Swal.fire({
        title: "Missing fields",
        text: "Question and answer are required.",
        icon: "warning",
        customClass: { container: styles.swalAbove },
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("deckId", deckId);
      formData.append("question", question.trim());
      formData.append("answer", answer.trim());

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`${API_BASE}/addCard.php`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setOpen(false);
        setSuccess(true);
        resetForm();

        if (onCardAdded) onCardAdded();

        setTimeout(() => setSuccess(false), 2000);
      } else {
        Swal.fire({
          title: "Failed",
          text: data.message || "Failed to add card.",
          icon: "error",
          customClass: { container: styles.swalAbove },
        });
      }
    } catch (error) {
      console.error("Add card error:", error);

      Swal.fire({
        title: "Server Error",
        text: "Something went wrong while adding the card.",
        icon: "error",
        customClass: { container: styles.swalAbove },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className={styles.openBtn} onClick={() => setOpen(true)}>
        Add Card
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <span className={styles.title}>Add New Card</span>
            </div>

            <div className={styles.formGroup}>
              <label>Question</label>
              <input
                type="text"
                placeholder="Add a question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Answer</label>
              <input
                type="text"
                placeholder="Add an answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            {preview && (
              <div className={styles.imagePreview}>
                <img src={preview} alt="preview" />
                <button
                  type="button"
                  className={styles.removeImg}
                  onClick={removeImage}
                >
                  ✕
                </button>
              </div>
            )}

           <label className={styles["attach-img"]}>
              <i className="bx bx-image"></i> Attach image

              <input
                type="file"
                ref={imageInputRef}
                className={styles.fileInput}
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {imageName && (
              <div className={styles.uploadedFile}>
                <i className="bx bx-check-circle"></i>
                <span>{imageName}</span>
                <button type="button" onClick={removeImage}>
                  Remove
                </button>
              </div>
            )}

            <hr className={styles.divider} />

            <div className={styles.actions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className={styles.overlay}>
          <div className={styles.successBox}>
            <p>Card Successfully Added</p>
          </div>
        </div>
      )}
    </>
  );
}