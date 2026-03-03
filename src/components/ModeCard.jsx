import { useNavigate } from "react-router-dom";
import styles from "./ModeCard.module.css";

export default function ModeCard({ title, img, desc, link }) {
  const navigate = useNavigate();

  return (
    <div
      className={styles.modeCard}
      onClick={() => navigate(link)}
    >
      <img
        src={img}
        alt={title}
        className={styles.icon}
      />

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{desc}</p>
    </div>
  );
}