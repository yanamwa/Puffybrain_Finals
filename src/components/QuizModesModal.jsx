import ModeCard from "./ModeCard";

export default function QuizModesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Choice Quiz Type</h2>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="mode-options">
          <ModeCard
            title="Timed Quiz"
            img="/image/timed.png"
            desc="Answer as many as you can before the time runs out."
            link="/timed-quiz"
          />
        </div>
      </div>
    </div>
  );
}