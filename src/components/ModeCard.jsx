import { useNavigate } from "react-router-dom";
import styles from "./ModeCard.module.css";

export default function ModeCard({ title, img, desc, link, lessonId }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${link}/${lessonId}`);
  };

  return (
    <div className={styles.modeCard} onClick={handleClick}>
      <img src={img} alt={title} className={styles.icon} />
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{desc}</p>
    </div>
  );
}