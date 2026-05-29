import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuizModesModal from "../../components/QuizModesModal";
import { API_BASE } from "../../config.js";
import styles from "./userDecks.module.css";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";


export default function UserDecks() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [activeTab, setActiveTab] = useState("All Cards");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deck, setDeck] = useState(null);
  const [myDecks, setMyDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showUploadLesson, setShowUploadLesson] = useState(false);
  const [lessonFile, setLessonFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [trueFalseCount, setTrueFalseCount] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
const [notificationOpen, setNotificationOpen] = useState(false);
const [notifications, setNotifications] = useState([]);
const [isDeckSaved, setIsDeckSaved] = useState(false);
const DECK_TITLE_LIMIT = 100;
const DESCRIPTION_LIMIT = 300;
const QUESTION_LIMIT = 300;
const ANSWER_LIMIT = 300;

const getCharCount = (value) => String(value || "").length;
const limitChars = (value, limit) => String(value || "").slice(0, limit);

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasTooMuchRepeatedPattern = (value) => {
  const text = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();

  if (text.length < 12) return false;

  if (/(.){5,}/.test(text)) return true;

  const commonSpamPatterns = [
    "dadada",
    "awawaw",
    "asdfasdf",
    "qwertyqwerty",
    "hahaha",
    "hehehe",
  ];

  if (commonSpamPatterns.some((pattern) => text.includes(pattern))) return true;

  for (let size = 2; size <= 10; size += 1) {
    for (let start = 0; start <= text.length - size * 4; start += 1) {
      const pattern = text.slice(start, start + size);
      if (text.includes(pattern.repeat(4))) return true;
    }
  }

  const chunks = text.match(/.{1,4}/g) || [];
  const uniqueChunks = new Set(chunks);

  return chunks.length >= 8 && uniqueChunks.size <= 3;
};

const hasTooManyRepeatedWords = (value) => {
  const words = normalizeText(value).split(" ").filter(Boolean);
  if (words.length < 6) return false;

  const counts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const mostRepeated = Math.max(...Object.values(counts));
  if (mostRepeated >= 5) return true;

  for (let i = 0; i <= words.length - 4; i += 1) {
    if (
      words[i] === words[i + 1] &&
      words[i] === words[i + 2] &&
      words[i] === words[i + 3]
    ) {
      return true;
    }
  }

  for (let size = 2; size <= 4; size += 1) {
    for (let start = 0; start <= words.length - size * 3; start += 1) {
      const pattern = words.slice(start, start + size).join(" ");
      const repeated = [
        ...words.slice(start, start + size),
        ...words.slice(start, start + size),
        ...words.slice(start, start + size),
      ].join(" ");

      if (words.join(" ").includes(repeated) && pattern.length > 3) return true;
    }
  }

  return false;
};

const isLikelyGibberish = (value) => {
  const text = String(value || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();

  if (!text) return false;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;

  const suspiciousWords = words.filter((word) => {
    if (word.length < 8) return false;

    const vowels = (word.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowels / word.length;
    const hasLongConsonantRun = /[bcdfghjklmnpqrstvwxyz]{5,}/.test(word);

    return vowelRatio < 0.18 || hasLongConsonantRun;
  });

  const noSpaceText = text.replace(/\s+/g, "");
  const vowels = (noSpaceText.match(/[aeiou]/g) || []).length;
  const vowelRatio = noSpaceText.length ? vowels / noSpaceText.length : 0;
  const hasVeryLongNoSpaceText = words.length === 1 && noSpaceText.length >= 18;

  if (hasVeryLongNoSpaceText && vowelRatio < 0.22) return true;

  return suspiciousWords.length >= Math.ceil(words.length * 0.6);
};

const isInvalidText = (value) =>
  hasTooMuchRepeatedPattern(value) ||
  hasTooManyRepeatedWords(value) ||
  isLikelyGibberish(value);

const readJsonStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const getCardResultKey = (question, answer) => {
  return `${normalizeText(question)}|||${normalizeText(answer)}`;
};

const emptyQuizMemorizedOverrides = () => ({
  idOverrides: new Map(),
  textOverrides: new Map(),
});

const getQuizMemorizedOverrides = (currentDeckId) => {
  const savedResults =
    readJsonStorage(`deckQuizResults_${currentDeckId}`) ||
    readJsonStorage("lessonQuizResults") ||
    readJsonStorage("quizResults");

  const savedDeckId = savedResults?.deckId || savedResults?.deck_id;

  if (
    !savedResults ||
    savedResults.source !== "deck" ||
    Number(savedDeckId) !== Number(currentDeckId) ||
    !Array.isArray(savedResults.answers)
  ) {
    return emptyQuizMemorizedOverrides();
  }

  const idOverrides = new Map();
  const textOverrides = new Map();

  savedResults.answers.forEach((answer) => {
    const cardId = answer?.cardId || answer?.card_id || answer?.id;
    const isMemorized = answer.isCorrect ? 1 : 0;

    if (cardId) {
      idOverrides.set(Number(cardId), isMemorized);
    }

    const question = answer?.question || "";
    const correctAnswer = answer?.correctAnswer || answer?.answer || "";

    if (question || correctAnswer) {
      textOverrides.set(getCardResultKey(question, correctAnswer), isMemorized);
    }
  });

  return { idOverrides, textOverrides };
};

const applyQuizMemorizedOverrides = (deckCards, currentDeckId) => {
  const { idOverrides, textOverrides } = getQuizMemorizedOverrides(currentDeckId);

  if (idOverrides.size === 0 && textOverrides.size === 0) return deckCards;

  return deckCards.map((card) => {
    const cardId = Number(card.cardId || card.card_id || card.id);
    const textKey = getCardResultKey(card.question, card.answer);

    if (idOverrides.has(cardId)) {
      return {
        ...card,
        is_memorized: idOverrides.get(cardId),
      };
    }

    if (textOverrides.has(textKey)) {
      return {
        ...card,
        is_memorized: textOverrides.get(textKey),
      };
    }

    return card;
  });
};

const notificationCount = notifications.filter(
  (notif) => notif.status !== "read"
).length;

  const [user, setUser] = useState({
    id: "",
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [imageName, setImageName] = useState("");

  const imageInputRef = useRef(null);
  const lessonInputRef = useRef(null);

  const categories = [
    "Reviewer",
    "Mathematics",
    "Science",
    "English",
    "Programming",
    "History",
    "Research",
    "Networking",
    "Database",
    "Web Development",
    "Cybersecurity",
    "Business",
    "Others",
  ];

const showUploadFailed = () => {
  Swal.fire({
    title: "Failed",
    text: "Can't generate for now, Try again Later",
    imageUrl: "/images/error.png",
    imageWidth: 160,
    imageHeight: 160,
    confirmButtonText: "OK",
    customClass: {
      popup: styles.uploadFailedPopup,
      image: styles.uploadFailedImage,
      title: styles.uploadFailedTitle,
      htmlContainer: styles.uploadFailedText,
      confirmButton: styles.uploadFailedBtn,
    },
    buttonsStyling: false,
  });
};

  const getCardImageSrc = (cardImage) => {
    if (!cardImage) return "";

    if (cardImage.startsWith("http://") || cardImage.startsWith("https://")) {
      return cardImage;
    }

    return `${API_BASE}/card_images/${cardImage}`;
  };

  const resetCardForm = () => {
    setQuestion("");
    setAnswer("");
    setEditingCardId(null);
    setImage(null);
    setPreview("");
    setImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const resetUploadForm = () => {
    setLessonFile(null);
    setQuestionCount(1);
    setTrueFalseCount(0);
    setDifficulty("easy");

    if (lessonInputRef.current) {
      lessonInputRef.current.value = "";
    }
  };

  const closeAddCard = () => {
    setShowAddCard(false);
    resetCardForm();
  };

  const closeUploadLesson = () => {
    setShowUploadLesson(false);
    resetUploadForm();
  };

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

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const fetchNotifications = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/getUserNotifications.php`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (data.success) {
      setNotifications(data.notifications || []);
    } else {
      setNotifications([]);
    }
  } catch (err) {
    console.error("Notification fetch error:", err);
    setNotifications([]);
  }
};

const markNotificationsAsRead = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/markNotificationsAsRead.php`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (data.success) {
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          status: "read",
        }))
      );
    }
  } catch (err) {
    console.error("Mark notifications error:", err);
  }
};

const [deckError, setDeckError] = useState("");

const fetchDeck = async () => {
  try {
    const res = await fetch(`${API_BASE}/getDeckById.php?deckId=${deckId}`, {
      credentials: "include",
    });

    const text = await res.text();
    console.log("GET DECK RAW:", text);

    const data = JSON.parse(text);

    if (data.success) {
      setDeck(data.deck);
      setDeckError("");
    } else {
      console.error("Failed to fetch deck:", data.message);
      setDeckError(data.message || "Failed to load deck.");
      setDeck(null);
    }
  } catch (err) {
    console.error("fetchDeck error:", err);
    setDeckError("Server error while loading deck.");
    setDeck(null);
  }
};

const fetchCards = async () => {
  try {
    console.log("Current deckId:", deckId);

    const res = await fetch(
      `${API_BASE}/getCardsByDeck.php?deckId=${deckId}`,
      { credentials: "include" }
    );

    const data = await res.json();

    if (data.success) {
      console.log("Fetched cards:", data.cards);
      setCards(applyQuizMemorizedOverrides(data.cards || [], deckId));
    } else {
      console.error("Cards fetch failed:", data.message);
      setCards([]);
    }
  } catch (err) {
    console.error("fetchCards error:", err);
    setCards([]);
  }
};
  const fetchUserDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/userDecks.php`, {
        credentials: "include",
      });

      const data = await res.json();
      setMyDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("fetchUserDecks error:", err);
      setMyDecks([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/getMyCourses.php`, {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("fetchCourses error:", err);
      setCourses([]);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/getUser.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser({
          id: data.user?.id || data.user?.user_id || "",
          username: data.user?.username || "",
          year_level: data.user?.year_level || "",
          profile_image:
            data.user?.profile_image || "/images/temporary profile.jpg",
        });
      }
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    if (!deckId) {
      console.error("deckId is missing from route params");
      return;
    }

    fetchDeck();
    fetchCards();
    fetchUserDecks();
    fetchCourses();
    fetchUser();
    fetchNotifications();
  }, [deckId]);

useEffect(() => {
  const handler = (e) => {
    const insideHeaderDropdown = e.target.closest(
      '[data-user-header], [data-user-header-menu], [data-user-header-toggle], [class*="dropdownBtn"], [class*="dropdownContent"], [class*="profileWrapper"], [class*="notificationWrapper"], [class*="searchBar"]'
    );

    if (!insideHeaderDropdown) {
      setDropdownOpen(false);
      setNotificationOpen(false);
    }
  };

  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const isOwner =
    Number(deck?.created_by || deck?.creator_id || deck?.user_id) ===
      Number(user?.id) ||
    String(deck?.creator_username || "").toLowerCase() ===
      String(user?.username || "").toLowerCase();

      const isAddedToMyDecks = myDecks.some(
  (item) => Number(item.deck_id || item.id) === Number(deckId)
);

const heartSaved = isDeckSaved || isAddedToMyDecks;

  const openAddCard = () => {
    resetCardForm();
    setShowAddCard(true);
  };

  const handleShare = async () => {
    const deckLink = `${window.location.origin}/deck/${deckId}`;

    try {
      await navigator.clipboard.writeText(deckLink);

      toast.success("Deck link copied!", {
        className: styles.toastSuccess,
        progressClassName: styles.toastSuccessProgress,
        icon: <i className="bx bx-check-circle"></i>,
      });
    } catch (error) {
      console.error("Failed to copy deck link:", error);

      toast.error("Unable to copy the deck link.", {
        className: styles.toastError,
        progressClassName: styles.toastErrorProgress,
        icon: <i className="bx bx-error-circle"></i>,
      });
    }
  };

const handleAddToMyDecks = async () => {
  if (!deckId) return;

  try {
    // IF ALREADY SAVED → UNSAVE
    if (heartSaved) {
      const res = await fetch(
        `${API_BASE}/removeDeckFromMyDecks.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ deckId }),
        }
      );

      const text = await res.text();
        console.log("REMOVE RESPONSE:", text);
        const data = JSON.parse(text);

      if (data.success) {
        toast.success("Removed from My Decks!", {
          className: styles.toastSuccess,
          progressClassName: styles.toastSuccessProgress,
          icon: <i className="bx bx-check-circle"></i>,
        });

        setMyDecks((prev) =>
          prev.filter(
            (item) =>
              Number(item.deck_id || item.id) !== Number(deckId)
          )
        );

        setIsDeckSaved(false);
      } else {
        toast.error(data.message || "Failed to remove deck.", {
          className: styles.toastError,
          progressClassName: styles.toastErrorProgress,
          icon: <i className="bx bx-error-circle"></i>,
        });
      }

      return;
    }

    // IF NOT SAVED → SAVE
    const res = await fetch(
      `${API_BASE}/addDeckToMyDecks.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ deckId }),
      }
    );

    const data = await res.json();

    if (data.success) {
      toast.success("Deck added to My Decks!", {
        className: styles.toastSuccess,
        progressClassName: styles.toastSuccessProgress,
        icon: <i className="bx bx-check-circle"></i>,
      });

      setMyDecks((prev) => [
        ...prev,
        { deck_id: Number(deckId) },
      ]);

      setIsDeckSaved(true);
    } else {
      toast.error(data.message || "Unable to save deck.", {
        className: styles.toastError,
        progressClassName: styles.toastErrorProgress,
        icon: <i className="bx bx-error-circle"></i>,
      });
    }
  } catch (err) {
    console.error("Toggle deck error:", err);

    toast.error("Something went wrong.", {
      className: styles.toastError,
      progressClassName: styles.toastErrorProgress,
      icon: <i className="bx bx-error-circle"></i>,
    });
  }
};

  const handleUploadLesson = async () => {
    if (!lessonFile) {
      Swal.fire("Missing file", "Please upload a lesson file.", "warning");
      return;
    }

    const safeQuestionCount = Math.min(
      100,
      Math.max(1, Number(questionCount))
    );

    const safeTrueFalseCount = Math.min(
      safeQuestionCount,
      Math.max(0, Number(trueFalseCount))
    );

    if (safeTrueFalseCount > safeQuestionCount) {
      Swal.fire({
        title: "Check questions",
        text: "True or False questions cannot be more than the total questions.",
        imageUrl: "/images/error.png",
        imageWidth: 160,
        imageHeight: 160,
        confirmButtonText: "OK",
        customClass: {
          popup: styles.uploadFailedPopup,
          image: styles.uploadFailedImage,
          title: styles.uploadFailedTitle,
          htmlContainer: styles.uploadFailedText,
          confirmButton: styles.uploadFailedBtn,
        },
        buttonsStyling: false,
      });

      return;
    }

    const formData = new FormData();
    formData.append("deckId", deckId);
    formData.append("lessonFile", lessonFile);
    formData.append("questionCount", safeQuestionCount);
    formData.append("trueFalseCount", safeTrueFalseCount);
    formData.append("difficulty", difficulty);

    try {
      Swal.fire({
        title: "Generating Cards...",
        text: "Turning your lesson into questions and answers.",
        imageUrl: "/images/Loading.png",
        imageWidth: 220,
        imageHeight: 220,
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: styles.lessonPopup,
          image: styles.lessonPopupImage,
          title: styles.lessonPopupTitle,
          htmlContainer: styles.lessonPopupText,
          loader: styles.lessonPopupLoader,
        },
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await fetch(
        `${API_BASE}/uploadLessonCards.php`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("Not valid JSON:", text);
        showUploadFailed();
        return;
      }

      if (data.success) {
        closeUploadLesson();
        await fetchCards();

        Swal.fire({
          title: "Cards Generated!",
          text: `${
            data.inserted || safeQuestionCount
          } cards were added to your deck.`,
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
        });
 } else {
  console.error("Upload lesson failed:", data);

  if (data.limitReached) {
    Swal.fire({
      title: "Thank you!",
      text: "You used your free upload lesson, Thank you for using PuffyBrain",
      imageUrl: "/images/thankyou.png",
      imageWidth: 180,
      imageHeight: 180,
      confirmButtonText: "OK",
      customClass: {
        popup: styles.uploadFailedPopup,
        image: styles.uploadFailedImage,
        title: styles.uploadFailedTitle,
        htmlContainer: styles.uploadFailedText,
        confirmButton: styles.uploadFailedBtn,
      },
      buttonsStyling: false,
    });
    return;
  }

showUploadFailed();}
    } catch (err) {
      console.error("UPLOAD LESSON FETCH ERROR:", err);
      showUploadFailed();
    }
  };

const handleAddCard = async () => {
  if (!deckId) {
    showUploadFailed();
    return;
  }

  if (question.trim().length > QUESTION_LIMIT) {
  Swal.fire({
    title: "Question Too Long",
    text: `Question must not exceed ${QUESTION_LIMIT} characters.`,
    icon: "warning",
  });
  return;
}

if (answer.trim().length > ANSWER_LIMIT) {
  Swal.fire({
    title: "Answer Too Long",
    text: `Answer must not exceed ${ANSWER_LIMIT} characters.`,
    icon: "warning",
  });
  return;
}

  if (!question.trim() || !answer.trim()) {
    Swal.fire({
      title: "Missing fields",
      text: "Please fill in both question and answer.",
      imageUrl: "/images/error.png",
      imageWidth: 160,
      imageHeight: 160,
      confirmButtonText: "OK",

      customClass: {
        popup: styles.uploadFailedPopup,
        image: styles.uploadFailedImage,
        title: styles.uploadFailedTitle,
        htmlContainer: styles.uploadFailedText,
        confirmButton: styles.uploadFailedBtn,
      },

      

      buttonsStyling: false,
    });

    return;
  }

  if (isInvalidText(question) || isInvalidText(answer)) {
    Swal.fire({
      title: "Invalid Content",
      text: "Repeated words, repeated random characters, or keyboard-smash text are not allowed.",
      imageUrl: "/images/error.png",
      imageWidth: 160,
      imageHeight: 160,
      confirmButtonText: "OK",
      customClass: {
        popup: styles.uploadFailedPopup,
        image: styles.uploadFailedImage,
        title: styles.uploadFailedTitle,
        htmlContainer: styles.uploadFailedText,
        confirmButton: styles.uploadFailedBtn,
      },
      buttonsStyling: false,
    });
    return;
  }

  const formData = new FormData();
  formData.append("deckId", deckId);
  formData.append("question", limitChars(question, QUESTION_LIMIT).trim());
  formData.append("answer", limitChars(answer, ANSWER_LIMIT).trim());

  if (image) formData.append("image", image);
  if (editingCardId) formData.append("cardId", editingCardId);

  try {
    const url = editingCardId
      ? `${API_BASE}/updateCard.php`
      : `${API_BASE}/addCard.php`;

    const res = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      showUploadFailed();
      return;
    }

    if (data.success) {
      const isEditing = editingCardId !== null;

      resetCardForm();
      setShowAddCard(false);

      await fetchCards();

      Swal.fire({
        title: isEditing ? "Edit Successfully!" : "Card Added!",
        text: isEditing
          ? "The card was edited successfully."
          : "The card was added successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      showUploadFailed();
    }
  } catch (err) {
    console.error("handleAddCard error:", err);
    showUploadFailed();
  }
};

  const handleDeleteCard = async (cardId) => {
    if (!cardId) {
      Swal.fire("Missing Card ID", "This card has no valid ID.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Delete this card?",
      text: "This action cannot be undone.",
      imageUrl: "/images/error.png",
      imageWidth: 160,
      imageHeight: 160,
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: styles.deleteCardPopup,
        actions: styles.deleteCardActions,
        confirmButton: styles.deleteCardConfirm,
        cancelButton: styles.deleteCardCancel,
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("cardId", cardId);
      formData.append("deckId", deckId);

      const res = await fetch(`${API_BASE}/deleteCard.php`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        await fetchCards();

        Swal.fire({
          title: "Deleted!",
          text: "The card was removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", data.message || "Failed to delete card.", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Server Error", "Something went wrong.", "error");
    }
  };

const handleEditDeck = async () => {
  if (!deck) return;

  const currentCategory = deck.category || "Reviewer";
  const currentVisibility = deck.visibility || "private";
  const currentDeckColor = deck.deck_color || deck.deckColor || "#d7c2f7";
  const isCustomCategory = !categories.includes(currentCategory);

  const deckColors = [
    "#d7c2f7",
    "#a8e0c8",
    "#f5b29d",
    "#a99cf5",
    "#8fd7d0",
    "#ef9db8",
  ];

  const { value: formValues } = await Swal.fire({
    html: `
      <div class="${styles.editDeckModal}">
        <div class="${styles.editDeckHeader}">
          <span>Edit Deck</span>
        </div>

        <div class="${styles.editDeckBody}">
          <div class="${styles.editDeckGroup}">
            <label>Deck Title</label>
    <input
  id="swal-title"
  type="text"
  maxlength="${DECK_TITLE_LIMIT}"
  placeholder="Deck title"
  value="${limitChars(deck.title || "", DECK_TITLE_LIMIT)}"
/>

<small id="swal-title-counter">0/${DECK_TITLE_LIMIT} characters</small>
          </div>

          <div class="${styles.editDeckGroup}">
            <label>Description</label>
          <textarea
  id="swal-desc"
  maxlength="${DESCRIPTION_LIMIT}"
  placeholder="Optional"
>${limitChars(deck.description || "", DESCRIPTION_LIMIT)}</textarea>

<small id="swal-desc-counter">0/${DESCRIPTION_LIMIT} characters</small>
          </div>

          <div class="${styles.editDeckGroup}">
            <label>Category</label>

            <select id="swal-category" class="${styles.editCategorySelect}">
              ${categories
                .map(
                  (cat) => `
                    <option value="${cat}" ${
                    currentCategory === cat ||
                    (cat === "Others" && isCustomCategory)
                      ? "selected"
                      : ""
                  }>
                      ${cat}
                    </option>
                  `
                )
                .join("")}
            </select>

            <input
              id="swal-custom-category"
              class="${styles.editCustomCategory}"
              type="text"
              placeholder="Type category"
              value="${isCustomCategory ? currentCategory : ""}"
              style="display: ${
                currentCategory === "Others" || isCustomCategory
                  ? "block"
                  : "none"
              }; margin-top: 10px;"
            />
          </div>

          <div class="${styles.editDeckGroup}">
            <label>Visibility</label>

            <div class="${styles.editVisibilityRow}">
              <label class="${styles.editVisibilityOption}">
                <input
                  type="radio"
                  name="swal-visibility"
                  value="public"
                  ${currentVisibility === "public" ? "checked" : ""}
                />
                <span>Public</span>
              </label>

              <label class="${styles.editVisibilityOption}">
                <input
                  type="radio"
                  name="swal-visibility"
                  value="private"
                  ${currentVisibility === "private" ? "checked" : ""}
                />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div class="${styles.editDeckGroup}">
            <label>Deck Color</label>

            <div id="swal-color-picker" style="display:flex; gap:12px; margin-top:12px;">
              ${deckColors
                .map(
                  (color) => `
                    <button
                      type="button"
                      class="swal-color-btn"
                      data-color="${color}"
                      style="
                        background:${color};
                        width:34px;
                        height:34px;
                        border-radius:50%;
                        border:${
                          currentDeckColor === color
                            ? "3px solid #5d3a86"
                            : "2px solid transparent"
                        };
                        cursor:pointer;
                      "
                    ></button>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `,

    didOpen: () => {
      const titleInput = document.getElementById("swal-title");
      const descInput = document.getElementById("swal-desc");
      const titleCounter = document.getElementById("swal-title-counter");
      const descCounter = document.getElementById("swal-desc-counter");
      const categorySelect = document.getElementById("swal-category");
      const customInput = document.getElementById("swal-custom-category");
      const colorButtons = document.querySelectorAll(".swal-color-btn");

      const syncCounter = (input, counter, limit) => {
        input.value = limitChars(input.value, limit);
        const count = getCharCount(input.value);
        counter.textContent = `${count}/${limit} characters`;
        counter.style.color = count >= limit ? "#b0478f" : "#666";
      };

      titleInput.addEventListener("input", () =>
        syncCounter(titleInput, titleCounter, DECK_TITLE_LIMIT)
      );

      descInput.addEventListener("input", () =>
        syncCounter(descInput, descCounter, DESCRIPTION_LIMIT)
      );

      syncCounter(titleInput, titleCounter, DECK_TITLE_LIMIT);
      syncCounter(descInput, descCounter, DESCRIPTION_LIMIT);

      window.selectedDeckColor = currentDeckColor;

      categorySelect.addEventListener("change", () => {
        customInput.style.display =
          categorySelect.value === "Others" ? "block" : "none";
      });

      colorButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          colorButtons.forEach((button) => {
            button.style.border = "2px solid transparent";
          });

          btn.style.border = "3px solid #5d3a86";
          window.selectedDeckColor = btn.dataset.color;
        });
      });
    },

    showCancelButton: true,
    confirmButtonText: "Save",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusConfirm: false,
customClass: {
  popup: styles.editDeckPopup,
  htmlContainer: styles.editDeckHtml,
  actions: styles.editDeckActions,
  confirmButton: styles.editDeckSave,
  cancelButton: styles.editDeckCancel,
},
    buttonsStyling: false,

 preConfirm: () => {
  const title = limitChars(document.getElementById("swal-title").value, DECK_TITLE_LIMIT).trim();
  const description = limitChars(document.getElementById("swal-desc").value, DESCRIPTION_LIMIT).trim();

  if (title.length > DECK_TITLE_LIMIT) {
    Swal.showValidationMessage(
      `Deck title must not exceed ${DECK_TITLE_LIMIT} characters`
    );
    return false;
  }

  if (description.length > DESCRIPTION_LIMIT) {
    Swal.showValidationMessage(
      `Description must not exceed ${DESCRIPTION_LIMIT} characters`
    );
    return false;
  }

  if (isInvalidText(title) || isInvalidText(description)) {
    Swal.showValidationMessage(
      "Repeated words, repeated random characters, or keyboard-smash text are not allowed."
    );
    return false;
  }

const selectedCategory = document.getElementById("swal-category").value;

const customCategory = document
  .getElementById("swal-custom-category")
  .value.trim();

const visibility = document.querySelector(
  'input[name="swal-visibility"]:checked'
)?.value;
      const finalCategory =
        selectedCategory === "Others" ? customCategory : selectedCategory;

      const deck_color = window.selectedDeckColor || currentDeckColor;

      if (!title) {
        Swal.showValidationMessage("Deck title is required");
        return false;
      }

      if (!finalCategory) {
        Swal.showValidationMessage("Category is required");
        return false;
      }

      if (!/^[A-Za-z0-9 ]+$/.test(finalCategory)) {
        Swal.showValidationMessage("Only letters and numbers are allowed");
        return false;
      }

      if (!["public", "private"].includes(visibility)) {
        Swal.showValidationMessage("Invalid visibility");
        return false;
      }

      return {
        title,
        description,
        category: finalCategory,
        visibility,
        deck_color,
      };
    },
  });

  if (!formValues) return;

  try {
    const formData = new FormData();
    formData.append("deckId", deckId);
    formData.append("title", formValues.title);
    formData.append("description", formValues.description);
    formData.append("category", formValues.category);
    formData.append("visibility", formValues.visibility);
    formData.append("deck_color", formValues.deck_color);

    const res = await fetch(`${API_BASE}/updateDeck.php`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {
      await fetchDeck();
      await fetchUserDecks();

      Swal.fire({
        title: "Updated!",
        text: "Deck information updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Error", data.message || "Failed to update deck.", "error");
    }
  } catch (err) {
    console.error("handleEditDeck error:", err);
    Swal.fire("Server Error", "Could not update deck.", "error");
  }
};

  const handleEditCard = (card) => {
    const realCardId = card.cardId || card.id;

    if (!realCardId) {
      Swal.fire("Missing Card ID", "This card has no valid ID.", "error");
      return;
    }

    setQuestion(limitChars(card.question || "", QUESTION_LIMIT));
    setAnswer(limitChars(card.answer || "", ANSWER_LIMIT));
    setEditingCardId(realCardId);
    setShowAddCard(true);

    if (card.image) {
      setPreview(getCardImageSrc(card.image));
    } else {
      setPreview("");
    }

    setImage(null);
    setImageName("");
  };

  const getOnlyAnswer = (rawAnswer = "") => {
    const text = String(rawAnswer).trim();

    const match = text.match(/Correct Answer:\s*(.+)$/i);
    if (match) return match[1].trim();

    return text;
  };

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    let correctQuestions = [];
    let wrongQuestions = [];

    try {
      const savedQuizResults =
        readJsonStorage(`deckQuizResults_${deckId}`) ||
        readJsonStorage("lessonQuizResults") ||
        null;

      const quizAnswers =
        savedQuizResults?.source === "deck" &&
        Number(savedQuizResults?.deckId || savedQuizResults?.deck_id) ===
          Number(deckId) &&
        Array.isArray(savedQuizResults.answers)
          ? savedQuizResults.answers
          : [];

      correctQuestions = quizAnswers
        .filter((item) => item.isCorrect)
        .map((item) => normalizeText(item.question));

      wrongQuestions = quizAnswers
        .filter((item) => !item.isCorrect)
        .map((item) => normalizeText(item.question));
    } catch (error) {
      console.error("Quiz memorized filter error:", error);
    }

    return cards.filter((card) => {
      const cardQuestion = normalizeText(card.question);
      const answeredCorrectly = correctQuestions.includes(cardQuestion);
      const answeredWrong = wrongQuestions.includes(cardQuestion);
      const isMemorized =
        answeredCorrectly ||
        (!answeredWrong && Number(card.is_memorized) === 1);

      const matchesTab =
        activeTab === "All Cards" ||
        (activeTab === "Memorized" && isMemorized) ||
        (activeTab === "Not Memorized" && !isMemorized);

      const searchableText = [
        card.question,
        card.answer,
        card.image,
        isMemorized ? "memorized" : "not memorized",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || searchableText.includes(q);

      return matchesTab && matchesSearch;
    });
  }, [cards, activeTab, search]);

const handleLogout = () => {
  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#8d6cab",
    cancelButtonColor: "#b0b0b0",
    confirmButtonText: "Yes, Logout",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    customClass: {
      popup: styles.logoutPopup,
      title: styles.logoutTitle,
      htmlContainer: styles.logoutText,
      confirmButton: styles.logoutConfirm,
      cancelButton: styles.logoutCancel,
    },
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout API error:", err);
    }

    localStorage.removeItem("username");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_id");
    localStorage.removeItem("profile_image");

    sessionStorage.clear();

    navigate("/login", { replace: true });
  });
};
return (
  <div
    className={`${styles.container} ${
      isCollapsed ? styles.sidebarCollapsed : ""
    }`}
  >
    <UserSidebar
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      myDecks={myDecks}
      courses={courses}
      openCourse={openCourse}
      getDeckId={(deck) => deck.deck_id || deck.id}
    />

    <div className={styles.mainArea}>
      <UserHeader
        isCollapsed={isCollapsed}
        searchQuery={search}
        setSearchQuery={setSearch}
        handleSearchSubmit={(e) => e.preventDefault()}
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
        setDropdownOpen={setDropdownOpen}
        notificationCount={notificationCount}
        notifications={notifications}
        markNotificationsAsRead={markNotificationsAsRead}
        user={user}
        profileDropdownOpen={dropdownOpen}
        setProfileDropdownOpen={setDropdownOpen}
        handleLogout={handleLogout}
      />

      <main className={styles.main}>
            <section className={styles["deck-info-container"]}>
              <div
                className={styles["deck-top"]}
                style={{
                  backgroundColor: deck?.deck_color || "#c9cdfa",
                }}
              ></div>

              <div className={styles["deck-info"]}>
                {deck ? (
                  <>
                    <div className={styles.deckTitleRow}>
                      <h3 className={styles.deckTitleText}>{deck.title}</h3>

                      <div className={styles.deckActionBtns}>
                        <button
                          type="button"
                          onClick={handleShare}
                          className={styles.deckShareBtn}
                        >
                          <i className="bx bx-share-alt"></i>
                          Share
                        </button>
                        {!isOwner && (
                            <button
                              type="button"
                              onClick={handleAddToMyDecks}
                              className={`${styles.deckAddBtn} ${heartSaved ? styles.deckSavedBtn : ""}`}
                              title="Save to My Decks"
                            >
                              <i
                                className={`bx ${heartSaved ? "bxs-heart" : "bx-heart"}`}
                                style={{
                                  color: heartSaved ? "#ff1f3d" : "#999",
                                  fontSize: "24px",
                                }}
                              ></i>
                            </button>
                          )}

                          {isOwner && (
                            <button
                              type="button"
                              onClick={handleEditDeck}
                              className={styles.deckEditBtn}
                            >
                              <i className="bx bx-edit"></i>
                              Edit
                            </button>
                          )}
                      </div>
                    </div>

                    <p>{cards.length} cards</p>

                    <p className={styles.deckCategoryText}>
                      <i className="bx bxs-book"></i>
                      <span>{deck.category || "Reviewer"}</span>
                    </p>

                    <hr />

                    <div className={styles.desc}>
                      <p>Description</p>
                      <p className={styles.deckDescriptionText}>{deck.description || "No description"}</p>
                      <hr />
                    </div>

                    {isOwner ? (
                      <div className={styles.creatorSimple}>
                        <span className={styles.creatorLabel}>Created by you</span>

                        <span className={styles["deck-privacy"]}>
                          <span className={styles.dot}></span>
                          {deck?.visibility || "private"}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.creatorBox}>
                        <div className={styles.creatorLeft}>
                          <span className={styles.creatorLabel}>Created by</span>

                          <div className={styles.creatorUser}>
                            <img
                              src={
                                deck?.creator_profile_image ||
                                "/images/temporary profile.jpg"
                              }
                              alt="Creator"
                              className={styles.creatorImg}
                            />

                            <span className={styles.creatorName}>
                              @{deck?.creator_username || "unknown"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={styles.visitBtn}
                          onClick={() => {
                            const creatorId =
                              deck?.created_by || deck?.creator_id || deck?.user_id;

                            if (!creatorId) {
                              Swal.fire(
                                "Missing User",
                                "Creator ID was not found.",
                                "warning"
                              );
                              return;
                            }

                            navigate(`/user-profile/${creatorId}`);
                          }}
                        >
                          Visit Profile
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                 <p>{deckError || "Loading deck..."}</p>
                )}
              </div>
            </section>

            <section
              className={styles["cards-panel"]}
              style={{
                "--deck-color": deck?.deck_color || "#c9cdfa",
              }}
            >
              <div className={styles["cards-actions"]}>
                {isOwner && (
                  <>
                    <button
                      type="button"
                      className={styles.uploadLessonBtn}
                      onClick={() => setShowUploadLesson(true)}
                    >
                      <i className="bx bx-upload"></i>
                      Upload File
                    </button>

                    <button
                      type="button"
                      className={styles["add-cards"]}
                      onClick={openAddCard}
                    >
                      Add Cards
                    </button>
                  </>
                )}
<button
  type="button"
  className={styles.practice}
  onClick={() => {
    if (!cards || cards.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Quiz Available",
        text: "You need to add cards first before practicing.",
        confirmButtonText: "OK",

        customClass: {
          popup: styles.noQuizPopup,
          title: styles.noQuizTitle,
          htmlContainer: styles.noQuizText,
          confirmButton: styles.noQuizButton,
          icon: styles.noQuizIcon,
        },

        buttonsStyling: false,
      });

      return;
    }

    if (cards.length < 5) {
      Swal.fire({
        icon: "info",
        title: "Not Enough Cards",
        text: `You need at least 5 cards to start practicing. You currently have ${cards.length} card${
          cards.length === 1 ? "" : "s"
        }.`,
        confirmButtonText: "OK",

        customClass: {
          popup: styles.noQuizPopup,
          title: styles.noQuizTitle,
          htmlContainer: styles.noQuizText,
          confirmButton: styles.noQuizButton,
          icon: styles.noQuizIcon,
        },

        buttonsStyling: false,
      });

      return;
    }

    setShowModes(true);
  }}
>
  Practice
</button>
              </div>

              <div className={styles["cards-tabs"]}>
                {["All Cards", "Not Memorized", "Memorized"].map((tab) => (
                  <span
                    key={tab}
                    className={activeTab === tab ? styles["active-tab"] : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              {filteredCards.length === 0 ? (
                <div className={styles.emptyState}>
                  <img
                    src="/images/celeb.png"
                    alt="Celebration"
                    className={styles.emptyImage}
                  />

                  <p className={styles["empty-msg"]}>
                    {search.trim()
                      ? `No cards found for "${search}".`
                      : activeTab === "Not Memorized"
                      ? "Congratulations! You memorized all cards 🎉"
                      : activeTab === "Memorized"
                      ? "There are no memorized cards"
                      : "There are no cards"}
                  </p>
                </div>
              ) : (
                <div className={styles.cardsList}>
                  {filteredCards.map((card) => {
                    const realCardId = card.cardId || card.id;

                    return (
                      <div key={realCardId} className={styles.cards}>
                        {isOwner && (
                          <div className={styles.cardHeader}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => handleEditCard(card)}
                            >
                              <i className="bx bx-edit"></i>
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteCard(realCardId)}
                            >
                              <i className="bx bx-trash"></i>
                              <span>Delete</span>
                            </button>
                          </div>
                        )}

                       <p className={styles.cardQuestionText}>
                          {String(card.question || "")
                            .replace(/\s*A\..*/is, "")
                            .trim()}
                        </p>

                        <hr />

                        <p className={styles.cardAnswerText}>{getOnlyAnswer(card.answer)}</p>

                        {card.image && (
                          <img
                            src={getCardImageSrc(card.image)}
                            alt="card"
                            className={styles.cardImage}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

      </main>
    </div>

      {showUploadLesson && (
        <div
          className={styles["modal-overlay"]}
          onClick={closeUploadLesson}
          style={{ display: "flex" }}
        >
          <div
            className={styles["add-card-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["add-card-modalheader"]}>
              <span>Upload Lesson</span>
            </div>

            <div className={styles["form-group"]}>
              <label>Upload file</label>

              {!lessonFile ? (
                <label className={styles["attach-img"]}>
                  <i className="bx bx-upload"></i>
                  Choose lesson file

                  <input
                    type="file"
                    ref={lessonInputRef}
                    className={styles.fileInput}
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={(e) => setLessonFile(e.target.files?.[0] || null)}
                  />
                </label>
              ) : (
                <div className={styles.uploadedFile}>
                  <i className="bx bx-check-circle"></i>

                  <span>{lessonFile.name}</span>

                  <button
                    type="button"
                    className={styles.removeUploadBtn}
                    onClick={() => {
                      setLessonFile(null);

                      if (lessonInputRef.current) {
                        lessonInputRef.current.value = "";
                      }
                    }}
                  >
                    <i className="bx bx-x"></i>
                  </button>
                </div>
              )}
            </div>
<div className={styles["form-group"]}>
  <label>How many questions?</label>

  <input
    type="number"
    min="1"
    max="100"
    value={questionCount}
    onChange={(e) => {
      const value = Math.min(100, Math.max(1, Number(e.target.value)));

      setQuestionCount(value);

      // auto adjust true/false if exceeded
      if (trueFalseCount > value) {
        setTrueFalseCount(value);
      }
    }}
  />

  <small className={styles.questionHint}>
    Multiple Choice Questions:{" "}
    {Math.max(0, questionCount - trueFalseCount)}
  </small>
</div>

<div className={styles["form-group"]}>
  <label>How many True or False questions?</label>

  <input
    type="number"
    min="0"
    max={questionCount}
    value={trueFalseCount}
    onChange={(e) => {
      let value = Number(e.target.value);

      // prevent negatives
      if (value < 0) value = 0;

      // prevent exceeding total questions
      if (value > questionCount) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Question Count",
          text: `True or False questions cannot exceed the total number of questions (${questionCount}).`,
          confirmButtonText: "OK",

          customClass: {
            popup: styles.noQuizPopup,
            title: styles.noQuizTitle,
            htmlContainer: styles.noQuizText,
            confirmButton: styles.noQuizButton,
            icon: styles.noQuizIcon,
          },

          buttonsStyling: false,
        });

        value = questionCount;
      }

      setTrueFalseCount(value);
    }}
  />

  <small className={styles.questionHint}>
    Remaining Multiple Choice Questions:{" "}
    {Math.max(0, questionCount - trueFalseCount)}
  </small>
</div>

            <div className={styles["form-group"]}>
              <label>Difficulty</label>
              <select
                className={styles.difficultySelect}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <hr />

            <div className={styles["modal-actions"]}>
              <button type="button" onClick={closeUploadLesson}>
                Cancel
              </button>

              <button type="button" onClick={handleUploadLesson}>
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCard && (
        <div
          className={styles["modal-overlay"]}
          onClick={closeAddCard}
          style={{ display: "flex" }}
        >
          <div
            className={styles["add-card-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["add-card-modalheader"]}>
              <span>{editingCardId ? "Edit Card" : "Add New Card"}</span>
            </div>

            <div className={styles["form-group"]}>
              <label>Question</label>
          <input
  type="text"
  placeholder="Add a question"
  maxLength={QUESTION_LIMIT}
  value={question}
  onChange={(e) => setQuestion(limitChars(e.target.value, QUESTION_LIMIT))}
/>

<small>
  {getCharCount(question)}/{QUESTION_LIMIT} characters
</small>
            </div>

            <div className={styles["form-group"]}>
              <label>Answer</label>
           <input
  type="text"
  placeholder="Add an answer"
  maxLength={ANSWER_LIMIT}
  value={answer}
  onChange={(e) => setAnswer(limitChars(e.target.value, ANSWER_LIMIT))}
/>

<small>
  {getCharCount(answer)}/{ANSWER_LIMIT} characters
</small>
            </div>

            {preview && (
              <div className={styles["image-preview"]}>
                <img src={preview} alt="preview" />

                <button
                  type="button"
                  className={styles["remove-img"]}
                  onClick={removeImage}
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
            )}

            {!imageName && (
              <label className={styles["attach-img"]}>
                <i className="bx bx-image"></i>
                Attach image

                <input
                  type="file"
                  ref={imageInputRef}
                  className={styles.fileInput}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}

            {imageName && (
              <div className={styles.uploadedFile}>
                <i className="bx bx-check-circle"></i>
                <span>{imageName}</span>
              </div>
            )}

            <hr />

            <div className={styles["modal-actions"]}>
              <button type="button" onClick={closeAddCard}>
                Cancel
              </button>

              <button type="button" onClick={handleAddCard}>
                {editingCardId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2200}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover={false}
        draggable={false}
      />

      {showModes && (
        <QuizModesModal
          source="deck"
          deckId={deckId}
          cards={cards}
          onClose={() => setShowModes(false)}
        />
      )}
    </div>
  );
}
