import { useState } from "react";
import QuizModesModal from "../../components/QuizModesModal";
import "./deck.module.css";

export default function DeckPage() {
  const [openModes, setOpenModes] = useState(false);

  return (
    <>
      <div className="deck-page">
        <button
          className="practice"
          onClick={() => setOpenModes(true)}
        >
          Practice
        </button>
      </div>

      {openModes && (
        <QuizModesModal onClose={() => setOpenModes(false)} />
      )}
    </>
  );
}