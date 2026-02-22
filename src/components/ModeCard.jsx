import { Link } from "react-router-dom";

export default function ModeCard({ title, img, desc, link }) {
  return (
    <Link to={link} className="mode-link">
      <div className="mode-card">
        <img src={img} className="mode-icon" alt={title} />
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </Link>
  );
}