import { useState, useRef } from "react";
import styles from "./Addnewcard.module.css";

export default function AddNewCard({ deckId, onCardAdded }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreview(null);
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
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
      alert("Missing deck ID");
      return;
    }

    if (!question.trim() || !answer.trim()) {
      alert("Question and answer are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("deckId", deckId);
      formData.append("question", question);
      formData.append("answer", answer);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("http://localhost/puffybrain/addCard.php", {
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
        alert(data.message || "Failed to add card");
      }
    } catch (error) {
      console.error("Add card error:", error);
      alert("Something went wrong while adding the card");
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

            <button
              type="button"
              className={styles.attachBtn}
              onClick={() => fileRef.current?.click()}
            >
              Attach image
            </button>

            <input
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />

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