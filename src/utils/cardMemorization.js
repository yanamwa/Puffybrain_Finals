import { API_BASE } from "../config.js";

export async function updateDeckCardMemorized(
  isDeckMode,
  cardId,
  isCorrect,
  extra = {}
) {
  if (!isDeckMode || !cardId) return;

  try {
    const res = await fetch(`${API_BASE}/updateCardMemorized.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        cardId,
        card_id: cardId,
        is_memorized: isCorrect ? 1 : 0,
        isMemorized: isCorrect ? 1 : 0,
        ...extra,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || data?.success === false) {
      console.error("Update memorized failed:", data || res.status);
    }
  } catch (error) {
    console.error("Update memorized error:", error);
  }
}

export async function syncDeckCardMemorizationFromAnswers(isDeckMode, answers) {
  if (!isDeckMode || !Array.isArray(answers) || answers.length === 0) return;

  const latestByCard = new Map();

  answers.forEach((answer) => {
    const cardId = answer?.cardId || answer?.card_id || answer?.id;
    if (!cardId) return;

    latestByCard.set(cardId, Boolean(answer.isCorrect));
  });

  await Promise.all(
    Array.from(latestByCard.entries()).map(([cardId, isCorrect]) =>
      updateDeckCardMemorized(true, cardId, isCorrect)
    )
  );
}
