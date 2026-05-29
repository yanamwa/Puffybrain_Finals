import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./Addmodule.module.css";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";

import AdminSidebar from "../../components/ASidebar";
import AdminHeader from "../../components/AHeader";

const TITLE_CHAR_LIMIT = 100;
const LONG_TEXT_CHAR_LIMIT = 750;
const QUIZ_CHAR_LIMIT = 100;
const EXPLANATION_CHAR_LIMIT = 750;

function getCharCount(value) {
  return String(value || "").length;
}

function limitChars(value, limit) {
  return String(value || "").slice(0, limit);
}

function hasTooMuchRepeatedPattern(value) {
  const text = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();

  if (text.length < 12) return false;

  if (/(.)\1{5,}/.test(text)) return true;

  const commonSpamPatterns = [
    "dadada",
    "awawaw",
    "asdfasdf",
    "qwertyqwerty",
    "hahaha",
    "hehehe",
  ];

  if (commonSpamPatterns.some((pattern) => text.includes(pattern))) {
    return true;
  }

  for (let size = 2; size <= 10; size++) {
    for (let start = 0; start <= text.length - size * 4; start++) {
      const pattern = text.slice(start, start + size);
      const repeated = pattern.repeat(4);

      if (text.includes(repeated)) return true;
    }
  }

  const chunks = text.match(/.{1,4}/g) || [];
  const uniqueChunks = new Set(chunks);

  return chunks.length >= 8 && uniqueChunks.size <= 3;
}

function isLikelyGibberish(value) {
  const raw = String(value || "").toLowerCase().trim();
  const cleaned = raw.replace(/[^a-z\s]/g, "").trim();

  if (cleaned.length < 12) return false;

  const words = cleaned.split(/\s+/).filter(Boolean);
  const joined = cleaned.replace(/\s+/g, "");

  if (!words.length || joined.length < 12) return false;

  const knownTechnicalTerms = new Set([
    "html",
    "css",
    "php",
    "mysql",
    "react",
    "vite",
    "xampp",
    "api",
    "json",
    "sql",
    "ipv4",
    "cidr",
    "dhcp",
    "dns",
    "tcp",
    "udp",
    "http",
    "https",
    "ssh",
    "vlan",
    "nat",
    "cpu",
    "ram",
    "ssd",
    "gpu",
  ]);

  const meaningfulWords = words.filter((word) => {
    if (knownTechnicalTerms.has(word)) return true;
    if (/\d/.test(word)) return true;
    return word.length <= 7;
  });

  const longWords = words.filter((word) => word.length >= 8);

  if (longWords.length === 0) return false;

  let suspicious = 0;

  for (const word of longWords) {
    if (knownTechnicalTerms.has(word) || /\d/.test(word)) continue;

    const vowels = (word.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowels / word.length;
    const consonantRuns = word.match(/[bcdfghjklmnpqrstvwxyz]{5,}/g) || [];

    if (vowelRatio < 0.18 || consonantRuns.length > 0) {
      suspicious++;
    }
  }

  const suspiciousRatio = suspicious / longWords.length;

  if (words.length === 1 && joined.length >= 16 && suspiciousRatio >= 0.5) {
    return true;
  }

  if (meaningfulWords.length >= Math.ceil(words.length * 0.6)) {
    return false;
  }

  return suspicious >= 2 && suspiciousRatio >= 0.5;
}

function isInvalidText(value) {
  return hasTooMuchRepeatedPattern(value) || isLikelyGibberish(value);
}

function counterClass(current, limit) {
  return current >= limit
    ? `${styles.wordCounter} ${styles.wordCounterFull}`
    : styles.wordCounter;
}

function serializeQuizItems(items) {
  return JSON.stringify(
    items.map((item) => ({
      question: String(item.question || "").trim(),
      options: Array.isArray(item.options)
        ? item.options.map((opt) => String(opt || "").trim())
        : [],
      correct_answer: String(item.correct_answer || "").trim(),
      explanation: String(item.explanation || "").trim(),
    }))
  );
}

function parseLessonPages(raw) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.map((page, index) => ({
        id: index + 1,
        title: limitChars(
          String(page.title || `Lesson Page ${index + 1}`).trim(),
          TITLE_CHAR_LIMIT
        ),
        content: limitChars(
          String(page.content || "").trim(),
          LONG_TEXT_CHAR_LIMIT
        ),
      }));
    }
  } catch {
    return [
      {
        id: 1,
        title: "Lesson Content",
        content: limitChars(String(raw || "").trim(), LONG_TEXT_CHAR_LIMIT),
      },
    ];
  }

  return [];
}

function serializeLessonPages(pages) {
  return JSON.stringify(
    pages.map((page) => ({
      title: String(page.title || "").trim(),
      content: String(page.content || "").trim(),
    }))
  );
}

export default function AddModule() {
  const navigate = useNavigate();

  const API_URL = `${API_BASE}/adminLearningModule.php`;
  const AI_API_URL = `${API_BASE}/generateQuiz.php`;
  const EXTRACT_API_URL = `${API_BASE}/processLessonFile.php`;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [bellNotifications, setBellNotifications] = useState([]);
  const notificationCount = bellNotifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const [admin, setAdmin] = useState({
    username: "Admin",
    full_name: "",
    email: "",
    role: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newLearningObjectives, setNewLearningObjectives] = useState("");
  const [newLessonPages, setNewLessonPages] = useState([]);
  const [newStatus, setNewStatus] = useState("draft");

  const [newQuizItems, setNewQuizItems] = useState([]);
  const [generatingNewQuiz, setGeneratingNewQuiz] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractingFile, setExtractingFile] = useState(false);

  const handleLimitedChange = (setter, limit) => (e) => {
    setter(limitChars(e.target.value, limit));
  };

  const handleLimitedLessonChange = (index, field, limit) => (e) => {
    updateLessonPage(index, field, limitChars(e.target.value, limit));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/admin/login";
  };

  const fetchAdmin = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAdminProfile.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        console.error(data.message || "Admin not found");
        return;
      }

      setAdmin({
        username: data.admin?.username || "Admin",
        full_name: data.admin?.full_name || "",
        email: data.admin?.email || "",
        role: data.admin?.role || "Administrator",
        profile_image: data.admin?.profile_image || "/images/temporary profile.jpg",
      });
    } catch (err) {
      console.error("Fetch admin error:", err);
    }
  };

  const fetchBellNotifications = async () => {
    try {
      const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");

      const res = await fetch(
        `${API_BASE}/getAdminNotifications.php?admin_id=${storedAdmin.id || ""}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.success) {
        setBellNotifications(data.notifications || []);
      } else {
        setBellNotifications([]);
      }
    } catch (err) {
      console.error("Bell notification fetch error:", err);
      setBellNotifications([]);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
    const adminId = storedAdmin.id;

    if (!adminId) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No admin ID found. Please log in again.",
        buttonsStyling: false,
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/markAdminNotificationsRead.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_id: adminId }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchBellNotifications();
        setNotificationOpen(true);
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to mark as read.",
          buttonsStyling: false,
        });
      }
    } catch (err) {
      console.error("Mark all as read error:", err);

      await Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Failed to mark as read.",
        buttonsStyling: false,
      });
    }
  };

  useEffect(() => {
    fetchAdmin();
    fetchBellNotifications();

    const handler = (e) => {
      const insideDropdown = e.target.closest(`.${styles.notificationWrapper}`);

      if (!insideDropdown) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);
  }, []);

  const handleUploadAndExtract = async () => {
    if (!uploadedFile) {
      await Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please choose a PDF, DOCX, or TXT file first.",
        buttonsStyling: false,
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Replace Current Module Content?",
      text: "This will replace the current title, description, subject, objectives, and lesson pages with the uploaded file content.",
      showCancelButton: true,
      confirmButtonText: "Yes, replace it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: styles.replacePopup,
        title: styles.replaceTitle,
        htmlContainer: styles.replaceHtml,
        confirmButton: styles.replaceConfirmBtn,
        cancelButton: styles.replaceCancelBtn,
      },
      buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    const formData = new FormData();
    formData.append("file", uploadedFile);

    setExtractingFile(true);

    Swal.fire({
      title: "Sorting Lesson...",
      text: "Organizing the file into lesson pages.",
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

    try {
      const res = await fetch(EXTRACT_API_URL, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("PHP did not return valid JSON.");
      }

      Swal.close();

      if (!data.success) {
        throw new Error(data.message || "Could not extract module content.");
      }

      setNewTitle(limitChars(data.module_title || "", TITLE_CHAR_LIMIT));
      setNewSubject(limitChars(data.subject || "", TITLE_CHAR_LIMIT));
      setNewDesc(limitChars(data.description || "", LONG_TEXT_CHAR_LIMIT));
      setNewLearningObjectives(
        limitChars(data.learning_objectives || "", LONG_TEXT_CHAR_LIMIT)
      );

      const pages =
        Array.isArray(data.lesson_pages) && data.lesson_pages.length > 0
          ? data.lesson_pages.map((page, index) => ({
              id: index + 1,
              title: limitChars(
                String(page.title || `Lesson Page ${index + 1}`).trim(),
                TITLE_CHAR_LIMIT
              ),
              content: limitChars(
                String(page.content || "").trim(),
                LONG_TEXT_CHAR_LIMIT
              ),
            }))
          : parseLessonPages(data.lesson_content || "");

      setNewLessonPages(pages);

      await Swal.fire({
        icon: "success",
        title: "Lesson Sorted",
        text: `${pages.length} lesson page(s) were created automatically.`,
        buttonsStyling: false,
      });
    } catch (err) {
      console.error("UPLOAD EXTRACT ERROR:", err);
      Swal.close();

      await Swal.fire({
        icon: "error",
        title: "Extraction Failed",
        text: err.message || "Something went wrong while extracting the file.",
        buttonsStyling: false,
      });
    } finally {
      setExtractingFile(false);
    }
  };

  const getLessonContentForAI = () => {
    return newLessonPages
      .map((page, index) => `Page ${index + 1}: ${page.title}\n${page.content}`)
      .join("\n\n");
  };

  const generateQuizFromAI = async ({
    questionCount = 5,
    trueFalseCount = 0,
    difficulty = "medium",
  }) => {
    const safeQuestionCount = Math.min(100, Math.max(1, Number(questionCount)));
    const safeTrueFalseCount = Math.min(
      safeQuestionCount,
      Math.max(0, Number(trueFalseCount))
    );

    const res = await fetch(AI_API_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lesson_title: newTitle,
        learning_objectives: newLearningObjectives,
        lesson_content: getLessonContentForAI(),
        question_count: safeQuestionCount,
        true_false_count: safeTrueFalseCount,
        difficulty,
      }),
    });

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("PHP did not return valid JSON.");
    }

    if (!data.success) {
      throw new Error(data.message || "Could not generate quiz.");
    }

    let questions = [];

    if (Array.isArray(data.quiz)) {
      questions = data.quiz;
    } else if (Array.isArray(data.quiz?.questions)) {
      questions = data.quiz.questions;
    } else if (Array.isArray(data.questions)) {
      questions = data.questions;
    }

    return questions.slice(0, 10).map((item, index) => ({
      id: index + 1,
      question: limitChars(String(item.question || "").trim(), QUIZ_CHAR_LIMIT),
      options: Array.isArray(item.options)
        ? [...item.options, "", "", ""].slice(0, 4).map((option) =>
            limitChars(String(option || "").trim(), QUIZ_CHAR_LIMIT)
          )
        : ["", "", "", ""],
      correct_answer: limitChars(
        String(item.correct_answer || item.correctAnswer || "").trim(),
        QUIZ_CHAR_LIMIT
      ),
      explanation: limitChars(
        String(item.explanation || "").trim(),
        EXPLANATION_CHAR_LIMIT
      ),
    }));
  };

  const handleGenerateQuizForNew = async () => {
    if (!newLearningObjectives.trim() && newLessonPages.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Content",
        text: "Please enter learning objectives or lesson pages first.",
        buttonsStyling: false,
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      html: `
        <div class="${styles.quizGenerateModal}">
          <div class="${styles.quizGenerateHeader}">
            <span>Generate Quiz</span>
          </div>

          <div class="${styles.quizGenerateBody}">
            <div class="${styles.quizGenerateGroup}">
              <label>How many questions?</label>
              <input id="swal-question-count" type="number" min="1" max="100" value="5" />
              <small>Maximum displayed after generation: 10 questions</small>
            </div>

            <div class="${styles.quizGenerateGroup}">
              <label>How many True or False questions?</label>
              <input id="swal-truefalse-count" type="number" min="0" max="100" value="0" />
              <small id="mc-hint">Multiple Choice Questions: 5</small>
            </div>

            <div class="${styles.quizGenerateGroup}">
              <label>Difficulty</label>
              <select id="swal-difficulty">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Generate",
      cancelButtonText: "Cancel",
      customClass: {
        popup: styles.quizGeneratePopup,
        htmlContainer: styles.quizGenerateHtml,
        actions: styles.quizGenerateActions,
        confirmButton: styles.quizGenerateConfirm,
        cancelButton: styles.quizGenerateCancel,
      },
      didOpen: () => {
        const questionInput = document.getElementById("swal-question-count");
        const tfInput = document.getElementById("swal-truefalse-count");
        const mcHint = document.getElementById("mc-hint");

        const updateCounts = () => {
          let total = Number(questionInput.value) || 1;
          let trueFalse = Number(tfInput.value) || 0;

          total = Math.min(100, Math.max(1, total));
          trueFalse = Math.min(total, Math.max(0, trueFalse));

          questionInput.value = total;
          tfInput.value = trueFalse;

          mcHint.textContent = `Multiple Choice Questions: ${total - trueFalse}`;
        };

        questionInput.addEventListener("input", updateCounts);
        tfInput.addEventListener("input", updateCounts);
        updateCounts();
      },
      preConfirm: () => {
        const questionCount = Number(
          document.getElementById("swal-question-count").value
        );
        const trueFalseCount = Number(
          document.getElementById("swal-truefalse-count").value
        );
        const difficulty = document.getElementById("swal-difficulty").value;

        if (!questionCount || questionCount < 1 || questionCount > 100) {
          Swal.showValidationMessage("Questions must be between 1 and 100 only.");
          return false;
        }

        if (trueFalseCount < 0 || trueFalseCount > questionCount) {
          Swal.showValidationMessage(
            "True or False questions cannot be higher than total questions."
          );
          return false;
        }

        return {
          questionCount,
          trueFalseCount,
          difficulty,
        };
      },
    });

    if (!formValues) return;

    setGeneratingNewQuiz(true);

    try {
      const quizItems = await generateQuizFromAI({
        questionCount: formValues.questionCount,
        trueFalseCount: formValues.trueFalseCount,
        difficulty: formValues.difficulty,
      });

      setNewQuizItems(quizItems);

      await Swal.fire({
        icon: "success",
        title: "Quiz Generated",
        text: `${quizItems.length} quiz item(s) generated successfully.`,
        buttonsStyling: false,
      });
    } catch (err) {
      console.error("AI GENERATE NEW ERROR:", err);

      await Swal.fire({
        icon: "error",
        title: "Generation Failed",
        text: err.message || "Something went wrong while generating quiz.",
        buttonsStyling: false,
      });
    } finally {
      setGeneratingNewQuiz(false);
    }
  };

  const generateOptionsForItem = async (item) => {
    const res = await fetch(`${API_BASE}/generateOptions.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: item.question,
        correct_answer: item.correct_answer,
      }),
    });

    const data = await res.json();

    if (!data.success || !Array.isArray(data.wrong_options)) {
      throw new Error(data.message || "Could not generate wrong options.");
    }

    return {
      ...item,
      options: [...data.wrong_options].slice(0, 4).map((option) =>
        limitChars(String(option || "").trim(), QUIZ_CHAR_LIMIT)
      ),
      explanation: item.explanation?.trim()
        ? limitChars(item.explanation, EXPLANATION_CHAR_LIMIT)
        : limitChars(data.explanation || "", EXPLANATION_CHAR_LIMIT),
    };
  };

  const isTrueFalseQuestion = (item) => {
    const answer = String(item.correct_answer || "").trim().toLowerCase();
    const options = Array.isArray(item.options)
      ? item.options.map((opt) => String(opt || "").trim().toLowerCase())
      : [];

    return (
      ["true", "false"].includes(answer) &&
      options.includes("true") &&
      options.includes("false")
    );
  };

  const handleAddModule = async () => {
    if (!newTitle.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Title",
        text: "Module title is required.",
        buttonsStyling: false,
      });
      return;
    }

    const hasInvalidText =
      isInvalidText(newTitle) ||
      isInvalidText(newDesc) ||
      isInvalidText(newSubject) ||
      isInvalidText(newLearningObjectives) ||
      newLessonPages.some(
        (page) => isInvalidText(page.title) || isInvalidText(page.content)
      ) ||
      newQuizItems.some(
        (item) =>
          isInvalidText(item.question) ||
          isInvalidText(item.correct_answer) ||
          isInvalidText(item.explanation) ||
          item.options.some((option) => isInvalidText(option))
      );

    if (hasInvalidText) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Content",
        text: "Repeated random characters or keyboard-smash text is not allowed.",
        buttonsStyling: false,
      });
      return;
    }

    const completedQuizItems = [];

    for (const item of newQuizItems) {
      const hasQuestion = String(item.question || "").trim();
      const hasAnswer = String(item.correct_answer || "").trim();

      const hasEnoughOptions =
        isTrueFalseQuestion(item) ||
        item.options.slice(0, 4).every((opt) => String(opt || "").trim());

      if (hasQuestion && hasAnswer && !hasEnoughOptions) {
        try {
          const generatedItem = await generateOptionsForItem(item);
          completedQuizItems.push(generatedItem);
        } catch (err) {
          console.error("OPTION GENERATE ERROR:", err);

          await Swal.fire({
            icon: "error",
            title: "Options Not Generated",
            text: "Please fill all options before publishing.",
            buttonsStyling: false,
          });

          return;
        }
      } else {
        completedQuizItems.push(item);
      }
    }

    const hasLessons = newLessonPages.some(
      (page) =>
        String(page.title || "").trim() && String(page.content || "").trim()
    );

    const hasQuiz =
      completedQuizItems.length > 0 &&
      completedQuizItems.every((item) => {
        const hasQuestion = String(item.question || "").trim();
        const hasAnswer = String(item.correct_answer || "").trim();

        if (!hasQuestion || !hasAnswer) return false;

        if (isTrueFalseQuestion(item)) return true;

        return item.options.slice(0, 4).every((opt) => String(opt || "").trim());
      });

    const hasRequiredContent =
      newDesc.trim() &&
      newSubject.trim() &&
      newLearningObjectives.trim() &&
      hasLessons &&
      hasQuiz;

    const finalStatus = hasRequiredContent ? newStatus : "draft";

    const payload = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      subject: newSubject.trim(),
      learning_objectives: newLearningObjectives.trim(),
      lesson_content: serializeLessonPages(newLessonPages),
      status: finalStatus,
      quiz_contents: serializeQuizItems(completedQuizItems),
    };

    console.log("ADDING PAYLOAD:", payload);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("ADD RAW RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("PHP did not return valid JSON.");
      }

      if (data.success) {
        if (!hasRequiredContent && newStatus === "publish") {
          const missingFields = [];

          if (!newDesc.trim()) missingFields.push("• Module Description");
          if (!newSubject.trim()) missingFields.push("• Subject");
          if (!newLearningObjectives.trim()) {
            missingFields.push("• Learning Objectives");
          }
          if (!hasLessons) missingFields.push("• Lesson Pages");
          if (!hasQuiz) missingFields.push("• Quiz Module");

          await Swal.fire({
            icon: "warning",
            title: "Incomplete Input",
            html: `
              <p>Some required module content is missing.</p>
              <div style="text-align:left; display:inline-block;">
                ${missingFields.join("<br>")}
              </div>
              <p>Module was automatically saved as <b>Draft</b>.</p>
            `,
            buttonsStyling: false,
          });
        } else {
          await Swal.fire({
            icon: "success",
            title: "Added!",
            text: `Module successfully saved as ${
              finalStatus === "publish" ? "Published" : "Draft"
            }.`,
            buttonsStyling: false,
          });
        }

        navigate("/admin/modules");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Add Failed",
          text: data.message || "Failed to add module.",
          buttonsStyling: false,
        });
      }
    } catch (err) {
      console.error("ADD ERROR:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error adding module.",
        buttonsStyling: false,
      });
    }
  };

  const addLessonPage = async () => {
    const { value } = await Swal.fire({
      html: `
        <div class="${styles.quizGenerateModal}">
          <div class="${styles.quizGenerateHeader}">
            <span>Add Lesson Page</span>
          </div>

          <div class="${styles.quizGenerateBody}">
            <div class="${styles.quizGenerateGroup}">
              <label>Page Title</label>
              <input
                id="lesson-title"
                type="text"
                placeholder="Enter page title"
              />
              <small id="lesson-title-counter">0/${TITLE_CHAR_LIMIT} characters</small>
            </div>

            <div class="${styles.quizGenerateGroup}">
              <label>Page Content</label>
              <textarea
                id="lesson-content"
                class="${styles.popupLongTextarea}"
                placeholder="Enter page content"
              ></textarea>
              <small id="lesson-content-counter">0/${LONG_TEXT_CHAR_LIMIT} characters</small>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Add Page",
      cancelButtonText: "Cancel",
      customClass: {
        popup: styles.quizGeneratePopup,
        htmlContainer: styles.quizGenerateHtml,
        actions: styles.quizGenerateActions,
        confirmButton: styles.quizGenerateConfirm,
        cancelButton: styles.quizGenerateCancel,
      },
      didOpen: () => {
        const titleInput = document.getElementById("lesson-title");
        const contentInput = document.getElementById("lesson-content");
        const titleCounter = document.getElementById("lesson-title-counter");
        const contentCounter = document.getElementById("lesson-content-counter");

        const syncCounter = (input, counter, limit) => {
          input.value = limitChars(input.value, limit);
          const count = getCharCount(input.value);
          counter.textContent = `${count}/${limit} characters`;
          counter.style.color = count >= limit ? "#b0478f" : "#666";
        };

        titleInput.addEventListener("input", () =>
          syncCounter(titleInput, titleCounter, TITLE_CHAR_LIMIT)
        );

        contentInput.addEventListener("input", () =>
          syncCounter(contentInput, contentCounter, LONG_TEXT_CHAR_LIMIT)
        );
      },
      preConfirm: () => {
        const title = limitChars(
          document.getElementById("lesson-title")?.value || "",
          TITLE_CHAR_LIMIT
        ).trim();

        const content = limitChars(
          document.getElementById("lesson-content")?.value || "",
          LONG_TEXT_CHAR_LIMIT
        ).trim();

        if (!title || !content) {
          Swal.showValidationMessage("Please enter both page title and content.");
          return false;
        }

        return { title, content };
      },
    });

    if (!value) return;

    setNewLessonPages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: value.title,
        content: value.content,
      },
    ]);
  };

  const updateLessonPage = (index, field, value) => {
    setNewLessonPages((prev) =>
      prev.map((page, i) => (i === index ? { ...page, [field]: value } : page))
    );
  };

  const removeLessonPage = (index) => {
    setNewLessonPages((prev) => prev.filter((_, i) => i !== index));
  };

  const addNewQuizItem = async () => {
    const { value } = await Swal.fire({
      html: `
        <div class="${styles.quizGenerateModal}">
          <div class="${styles.quizGenerateHeader}">
            <span>Add Quiz Item</span>
          </div>

          <div class="${styles.quizGenerateBody}">
            <div class="${styles.quizGenerateGroup}">
              <label>Question</label>
              <input
                id="quiz-question"
                type="text"
                placeholder="Enter question"
              />
              <small id="question-counter">0/${QUIZ_CHAR_LIMIT} characters</small>
            </div>

            <div class="${styles.quizGenerateGroup}">
              <label>Wrong Options</label>
              <input id="quiz-option-1" type="text" maxlength="100" placeholder="Option 1" />
              <small id="option-1-counter">0/${QUIZ_CHAR_LIMIT} characters</small>
              <input id="quiz-option-2" type="text" maxlength="100" placeholder="Option 2" />
              <small id="option-2-counter">0/${QUIZ_CHAR_LIMIT} characters</small>
              <input id="quiz-option-3" type="text" maxlength="100" placeholder="Option 3" />
              <small id="option-3-counter">0/${QUIZ_CHAR_LIMIT} characters</small>
            </div>

            <div class="${styles.quizGenerateGroup}">
              <label>Correct Answer / Option 4</label>
              <input
                id="quiz-answer"
                type="text"
                placeholder="Enter correct answer"
              />
              <small id="answer-counter">0/${QUIZ_CHAR_LIMIT} characters</small>
            </div>

            <div class="${styles.quizGenerateGroup}">
              <label>Explanation</label>
              <textarea
                id="quiz-explanation"
                class="${styles.popupShortTextarea}"
                placeholder="Enter explanation"
              ></textarea>
              <small id="explanation-counter">0/${EXPLANATION_CHAR_LIMIT} characters</small>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Add Quiz",
      cancelButtonText: "Cancel",
      customClass: {
        popup: styles.quizGeneratePopup,
        htmlContainer: styles.quizGenerateHtml,
        actions: styles.quizGenerateActions,
        confirmButton: styles.quizGenerateConfirm,
        cancelButton: styles.quizGenerateCancel,
      },
      didOpen: () => {
        const questionInput = document.getElementById("quiz-question");
        const answerInput = document.getElementById("quiz-answer");
        const explanationInput = document.getElementById("quiz-explanation");

        const questionCounter = document.getElementById("question-counter");
        const answerCounter = document.getElementById("answer-counter");
        const explanationCounter = document.getElementById("explanation-counter");

        const optionInputs = [1, 2, 3].map((num) =>
          document.getElementById(`quiz-option-${num}`)
        );

        const optionCounters = [1, 2, 3].map((num) =>
          document.getElementById(`option-${num}-counter`)
        );

        const syncCounter = (input, counter, limit) => {
          input.value = limitChars(input.value, limit);
          const count = getCharCount(input.value);
          counter.textContent = `${count}/${limit} characters`;
          counter.style.color = count >= limit ? "#b0478f" : "#666";
        };

        questionInput.addEventListener("input", () =>
          syncCounter(questionInput, questionCounter, QUIZ_CHAR_LIMIT)
        );

        answerInput.addEventListener("input", () =>
          syncCounter(answerInput, answerCounter, QUIZ_CHAR_LIMIT)
        );

        optionInputs.forEach((input, index) => {
          input.addEventListener("input", () =>
            syncCounter(input, optionCounters[index], QUIZ_CHAR_LIMIT)
          );
        });

        explanationInput.addEventListener("input", () =>
          syncCounter(explanationInput, explanationCounter, EXPLANATION_CHAR_LIMIT)
        );
      },
      preConfirm: () => {
        const question = limitChars(
          document.getElementById("quiz-question")?.value || "",
          QUIZ_CHAR_LIMIT
        ).trim();

        const option1 = limitChars(
          document.getElementById("quiz-option-1")?.value || "",
          QUIZ_CHAR_LIMIT
        ).trim();

        const option2 = limitChars(
          document.getElementById("quiz-option-2")?.value || "",
          QUIZ_CHAR_LIMIT
        ).trim();

        const option3 = limitChars(
          document.getElementById("quiz-option-3")?.value || "",
          QUIZ_CHAR_LIMIT
        ).trim();

        const correct_answer = limitChars(
          document.getElementById("quiz-answer")?.value || "",
          QUIZ_CHAR_LIMIT
        ).trim();

        const explanation = limitChars(
          document.getElementById("quiz-explanation")?.value || "",
          EXPLANATION_CHAR_LIMIT
        ).trim();

        if (!question || !option1 || !option2 || !option3 || !correct_answer) {
          Swal.showValidationMessage(
            "Please fill in the question, 3 options, and correct answer."
          );
          return false;
        }

        return {
          question,
          options: [option1, option2, option3, correct_answer],
          correct_answer,
          explanation,
        };
      },
    });

    if (!value) return;

    setNewQuizItems((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        question: value.question,
        options: value.options,
        correct_answer: value.correct_answer,
        explanation: value.explanation,
      },
    ]);
  };

  const updateNewQuizQuestion = (index, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, question: limitChars(value, QUIZ_CHAR_LIMIT) } : item
      )
    );
  };

  const updateNewQuizOption = (itemIndex, optionIndex, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item;

        const updatedOptions = [...item.options];
        updatedOptions[optionIndex] = limitChars(value, QUIZ_CHAR_LIMIT);

        return { ...item, options: updatedOptions };
      })
    );
  };

  const updateNewCorrectAnswer = (index, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, correct_answer: limitChars(value, QUIZ_CHAR_LIMIT) }
          : item
      )
    );
  };

  const updateNewExplanation = (index, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              explanation: limitChars(value, EXPLANATION_CHAR_LIMIT),
            }
          : item
      )
    );
  };

  const removeNewQuizItem = (index) => {
    setNewQuizItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.gridContainer}>
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <AdminHeader
        admin={admin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
        bellNotifications={bellNotifications}
        notificationCount={notificationCount}
        handleMarkAllAsRead={handleMarkAllAsRead}
      />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Add Module</h1>
        </div>

        <div className={styles.formCard}>
          <div className={styles.popupInfoGrid}>
            <div className={styles.popupField}>
              <label className={styles.popupLabel}>
                Module Title <span className={styles.required}>*Required</span>
              </label>

              <input
                className={styles.popupInput}
                value={newTitle}
                onChange={handleLimitedChange(setNewTitle, TITLE_CHAR_LIMIT)}
                placeholder="Enter module title"
              />

              <div className={counterClass(getCharCount(newTitle), TITLE_CHAR_LIMIT)}>
                {getCharCount(newTitle)}/{TITLE_CHAR_LIMIT} characters
              </div>
            </div>

            <div className={styles.popupField}>
              <label className={styles.popupLabel}>Status</label>

              <select
                className={styles.popupSelect}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>
              Module Description <span className={styles.required}>*Required</span>
            </label>

            <textarea
              className={`${styles.popupTextarea} ${styles.popupSmallBox}`}
              value={newDesc}
              onChange={handleLimitedChange(setNewDesc, LONG_TEXT_CHAR_LIMIT)}
              placeholder="Enter module description"
            />

            <div className={counterClass(getCharCount(newDesc), LONG_TEXT_CHAR_LIMIT)}>
              {getCharCount(newDesc)}/{LONG_TEXT_CHAR_LIMIT} characters
            </div>
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>
              Subject <span className={styles.required}>*Required</span>
            </label>

            <input
              className={styles.popupInput}
              value={newSubject}
              onChange={handleLimitedChange(setNewSubject, TITLE_CHAR_LIMIT)}
              placeholder="Enter subject"
            />

            <div className={counterClass(getCharCount(newSubject), TITLE_CHAR_LIMIT)}>
              {getCharCount(newSubject)}/{TITLE_CHAR_LIMIT} characters
            </div>
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Upload Lesson File</label>

            <div className={styles.uploadRow}>
              <label className={styles.customFileBtn}>
                Choose File
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                />
              </label>

              <span className={styles.fileName}>
                {uploadedFile ? uploadedFile.name : "No file chosen"}
              </span>

              <button
                type="button"
                className={styles.popupAddBtn}
                onClick={handleUploadAndExtract}
                disabled={extractingFile}
              >
                {extractingFile ? "Sorting..." : "Upload and Auto Sort"}
              </button>
            </div>
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>
              Learning Objectives <span className={styles.required}>*Required</span>
            </label>

            <textarea
              className={`${styles.popupTextarea} ${styles.popupSmallBox}`}
              value={newLearningObjectives}
              onChange={handleLimitedChange(
                setNewLearningObjectives,
                LONG_TEXT_CHAR_LIMIT
              )}
              placeholder="Enter learning objectives"
            />

            <div
              className={counterClass(
                getCharCount(newLearningObjectives),
                LONG_TEXT_CHAR_LIMIT
              )}
            >
              {getCharCount(newLearningObjectives)}/{LONG_TEXT_CHAR_LIMIT} characters
            </div>
          </div>

          <div className={styles.popupSection}>
            <div className={styles.popupSectionRow}>
              <label className={styles.popupLabel}>
                Lesson Pages <span className={styles.required}>*Required</span>
              </label>

              <button
                type="button"
                className={styles.popupAddBtn}
                onClick={addLessonPage}
              >
                Add Page +
              </button>
            </div>

            {newLessonPages.length === 0 ? (
              <div className={styles.popupEmptyQuiz}>No lesson pages yet.</div>
            ) : (
              newLessonPages.map((page, index) => (
                <div key={index} className={styles.popupQuizCard}>
                  <div className={styles.popupQuizCardTop}>
                    <span className={styles.popupQuizCardTitle}>
                      Page {index + 1}
                    </span>

                    <button
                      type="button"
                      className={styles.popupRemoveBtn}
                      onClick={() => removeLessonPage(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    className={styles.popupInput}
                    value={page.title}
                    onChange={handleLimitedLessonChange(
                      index,
                      "title",
                      TITLE_CHAR_LIMIT
                    )}
                    placeholder="Page title"
                  />

                  <div className={counterClass(getCharCount(page.title), TITLE_CHAR_LIMIT)}>
                    {getCharCount(page.title)}/{TITLE_CHAR_LIMIT} characters
                  </div>

                  <textarea
                    className={`${styles.popupTextarea} ${styles.popupLargeBox}`}
                    value={page.content}
                    onChange={handleLimitedLessonChange(
                      index,
                      "content",
                      LONG_TEXT_CHAR_LIMIT
                    )}
                    placeholder="Page content"
                  />

                  <div
                    className={counterClass(
                      getCharCount(page.content),
                      LONG_TEXT_CHAR_LIMIT
                    )}
                  >
                    {getCharCount(page.content)}/{LONG_TEXT_CHAR_LIMIT} characters
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.popupSection}>
            <div className={styles.popupSectionRow}>
              <label className={styles.popupLabel}>
                Quiz Module <span className={styles.required}>*Required</span>
              </label>

              <div className={styles.quizActions}>
                <button
                  type="button"
                  className={styles.popupAddBtn}
                  onClick={handleGenerateQuizForNew}
                  disabled={generatingNewQuiz}
                >
                  {generatingNewQuiz ? "Generating..." : "Auto Generate"}
                </button>

                <button
                  type="button"
                  className={styles.popupAddBtn}
                  onClick={addNewQuizItem}
                >
                  Add +
                </button>
              </div>
            </div>

            {newQuizItems.length === 0 ? (
              <div className={styles.popupEmptyQuiz}>No quiz items yet.</div>
            ) : (
              newQuizItems.map((item, index) => (
                <div key={index} className={styles.popupQuizCard}>
                  <div className={styles.popupQuizCardTop}>
                    <span className={styles.popupQuizCardTitle}>
                      Item {index + 1}
                    </span>

                    <button
                      type="button"
                      className={styles.popupRemoveBtn}
                      onClick={() => removeNewQuizItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    className={styles.popupInput}
                    value={item.question}
                    onChange={(e) => updateNewQuizQuestion(index, e.target.value)}
                    placeholder="Question"
                  />

                  <div className={counterClass(getCharCount(item.question), QUIZ_CHAR_LIMIT)}>
                    {getCharCount(item.question)}/{QUIZ_CHAR_LIMIT} characters
                  </div>

                  <div className={styles.optionsGrid}>
                    {item.options.slice(0, 4).map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        className={styles.popupInput}
                        value={option}
                        onChange={(e) =>
                          updateNewQuizOption(index, optionIndex, e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    ))}
                  </div>

                  <input
                    className={styles.popupInput}
                    value={item.correct_answer}
                    onChange={(e) => updateNewCorrectAnswer(index, e.target.value)}
                    placeholder="Correct Answer"
                  />

                  <div
                    className={counterClass(
                      getCharCount(item.correct_answer),
                      QUIZ_CHAR_LIMIT
                    )}
                  >
                    {getCharCount(item.correct_answer)}/{QUIZ_CHAR_LIMIT} characters
                  </div>

                  <textarea
                    className={`${styles.popupTextarea} ${styles.popupAnswerBox}`}
                    value={item.explanation}
                    onChange={(e) => updateNewExplanation(index, e.target.value)}
                    placeholder="Explanation"
                  />

                  <div
                    className={counterClass(
                      getCharCount(item.explanation),
                      EXPLANATION_CHAR_LIMIT
                    )}
                  >
                    {getCharCount(item.explanation)}/{EXPLANATION_CHAR_LIMIT} characters
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.popupActions}>
            <button
              className={styles.popupCancelBtn}
              type="button"
              onClick={() => navigate("/admin/modules")}
            >
              Cancel
            </button>

            <button
              className={styles.popupSaveBtn}
              type="button"
              onClick={handleAddModule}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
