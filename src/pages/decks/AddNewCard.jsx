import { useState, useRef } from "react";
import styles from "./Addnewcard.module.css";

export default function AddNewCard() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);

  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAdd = () => {
    setOpen(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <>
      {/* OPEN BUTTON */}
      <button className={styles.openBtn} onClick={() => setOpen(true)}>
        Add Card
      </button>

      {/* ADD CARD MODAL */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <span className={styles.title}>Add New Card</span>
            </div>

            <div className={styles.formGroup}>
              <label>Question</label>
              <input type="text" placeholder="Add a question" />
            </div>

            <div className={styles.formGroup}>
              <label>Answer</label>
              <input type="text" placeholder="Add an answer" />
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
              >
                Cancel
              </button>
              <button
                className={styles.addBtn}
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
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