import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  LibraryBig,
  Gamepad2,
  LogOut,
  Search,
  User,
  Settings,
  Database,
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./editmodule.module.css";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";
import AdminSidebar from "../../components/ASidebar";
import AdminHeader from "../../components/AHeader";

const GENERATE_COOLDOWN_MS = 5 * 60 * 60 * 1000;
const GENERATE_COOLDOWN_KEY = "editModuleQuizGenerateCooldown";

function parseDeckCards(raw) {
  if (!raw) return [];

  const text = String(raw).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed.map((x, i) => ({
        id: i + 1,
        question: String(x.question || "").trim(),
        options: Array.isArray(x.options)
          ? [...x.options, "", "", "", ""].slice(0, 4)
          : ["", "", "", ""],
        correct_answer: String(x.correct_answer || x.correctAnswer || "").trim(),
        explanation: String(x.explanation || "").trim(),
      }));
    }
  } catch (error) {
    console.error("Invalid quiz JSON:", error);
  }

  return [];
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
        title: String(page.title || `Lesson Page ${index + 1}`).trim(),
        content: String(page.content || "").trim(),
      }));
    }
  } catch {
    return [
      {
        id: 1,
        title: "Lesson Content",
        content: String(raw || "").trim(),
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

export default function EditModule() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);

  const [admin, setAdmin] = useState({
    username: "Admin",
    full_name: "",
    email: "",
    role: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editLearningObjectives, setEditLearningObjectives] = useState("");
  const [editLessonPages, setEditLessonPages] = useState([]);
  const [editStatus, setEditStatus] = useState("draft");

  const [editQuizItems, setEditQuizItems] = useState([]);
  const [generatingEditQuiz, setGeneratingEditQuiz] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractingFile, setExtractingFile] = useState(false);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <i className="bx bx-bell"></i> },
    { label: "Backup & Restore", path: "/admin/backup-restore", icon: <Database size={20} /> },
  ];

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
      Swal.fire("Error", "No admin ID found. Please log in again.", "error");
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
        Swal.fire("Error", data.message || "Failed to mark as read.", "error");
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
      Swal.fire("Server Error", "Failed to mark as read.", "error");
    }
  };

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(API_URL, {
          credentials: "include",
        });

        const data = await res.json();

        if (data?.success && Array.isArray(data.modules)) {
          const mod = data.modules.find((m) => String(m.id) === String(id));

          if (!mod) {
            await Swal.fire({
              icon: "error",
              title: "Not Found",
              text: "Module not found.",
            });

            navigate("/admin/modules");
            return;
          }

          setEditTitle(mod.title || "");
          setEditDesc(mod.description || "");
          setEditSubject(mod.subject || "");
          setEditLearningObjectives(mod.learning_objectives || "");
          setEditLessonPages(parseLessonPages(mod.lesson_content || ""));
          setEditStatus(String(mod.status || "draft").toLowerCase());
          setEditQuizItems(parseDeckCards(mod.quiz_contents));
        }
      } catch (err) {
        console.error("LOAD ERROR:", err);

        await Swal.fire({
          icon: "error",
          title: "Load Failed",
          text: "Could not fetch module.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
    fetchBellNotifications();
    fetchModule();

    const handler = (e) => {
      const insideDropdown = e.target.closest(`.${styles.notificationWrapper}`);

      if (!insideDropdown) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);
  }, [id, navigate]);

  const handleUploadAndExtract = async () => {
    if (!uploadedFile) {
      await Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please choose a PDF, DOCX, or TXT file first.",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Replace Current Module Content?",
      text: "This will replace the current title, description, subject, objectives, and lesson pages.",
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
      didOpen: () => Swal.showLoading(),
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

      setEditTitle(data.module_title || "");
      setEditSubject(data.subject || "");
      setEditDesc(data.description || "");
      setEditLearningObjectives(data.learning_objectives || "");

      const pages =
        Array.isArray(data.lesson_pages) && data.lesson_pages.length > 0
          ? data.lesson_pages.map((page, index) => ({
              id: index + 1,
              title: String(page.title || `Lesson Page ${index + 1}`).trim(),
              content: String(page.content || "").trim(),
            }))
          : parseLessonPages(data.lesson_content || "");

      setEditLessonPages(pages);

      await Swal.fire({
        icon: "success",
        title: "Lesson Sorted",
        text: `${pages.length} lesson page(s) were created automatically.`,
      });
    } catch (err) {
      console.error("UPLOAD EXTRACT ERROR:", err);
      Swal.close();

      await Swal.fire({
        icon: "error",
        title: "Extraction Failed",
        text: err.message || "Something went wrong while extracting the file.",
      });
    } finally {
      setExtractingFile(false);
    }
  };

  const getLessonContentForAI = () => {
    return editLessonPages
      .map((page, index) => `Page ${index + 1}: ${page.title}\n${page.content}`)
      .join("\n\n");
  };

  const generateQuizFromAI = async ({
    questionCount = 5,
    trueFalseCount = 0,
    difficulty = "medium",
  }) => {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lesson_title: editTitle,
        learning_objectives: editLearningObjectives,
        lesson_content: getLessonContentForAI(),
        question_count: questionCount,
        true_false_count: trueFalseCount,
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
      question: String(item.question || "").trim(),
      options: Array.isArray(item.options)
        ? [...item.options, "", "", "", ""].slice(0, 4)
        : ["", "", "", ""],
      correct_answer: String(item.correct_answer || item.correctAnswer || "").trim(),
      explanation: String(item.explanation || "").trim(),
    }));
  };

  const handleGenerateQuizForEdit = async () => {
    const lastGeneratedAt = Number(localStorage.getItem(GENERATE_COOLDOWN_KEY) || 0);
    const now = Date.now();
    const timeLeft = GENERATE_COOLDOWN_MS - (now - lastGeneratedAt);

    if (lastGeneratedAt && timeLeft > 0) {
      const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));

      await Swal.fire({
        icon: "warning",
        title: "Generate Cooldown",
        text: `You can generate again in about ${hoursLeft} hour(s).`,
        buttonsStyling: false,
      });
      return;
    }

    if (!editLearningObjectives.trim() && editLessonPages.length === 0) {
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
              <small id="total-hint">Only 10 generated items will be shown</small>
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

          const multipleChoice = total - trueFalse;
          mcHint.textContent = `Multiple Choice Questions: ${multipleChoice}`;
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

    setGeneratingEditQuiz(true);

    try {
      const quizItems = await generateQuizFromAI({
        questionCount: formValues.questionCount,
        trueFalseCount: formValues.trueFalseCount,
        difficulty: formValues.difficulty,
      });

      setEditQuizItems(quizItems);
      localStorage.setItem(GENERATE_COOLDOWN_KEY, String(Date.now()));

      await Swal.fire({
        icon: "success",
        title: "Quiz Generated",
        text: `${quizItems.length} quiz item(s) generated successfully.`,
        buttonsStyling: false,
      });
    } catch (err) {
      console.error("AI GENERATE EDIT ERROR:", err);

      await Swal.fire({
        icon: "error",
        title: "Generation Failed",
        text: err.message || "Something went wrong while generating quiz.",
        buttonsStyling: false,
      });
    } finally {
      setGeneratingEditQuiz(false);
    }
  };

  const generateOptionsForItem = async (item) => {
    const res = await fetch(`${API_BASE}/generateOptions.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
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
      options: [...data.wrong_options].slice(0, 4),
      explanation: item.explanation?.trim()
        ? item.explanation
        : data.explanation || "",
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

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Title",
        text: "Module title is required.",
      });
      return;
    }

    const completedQuizItems = [];

    for (const item of editQuizItems) {
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
          });

          return;
        }
      } else {
        completedQuizItems.push(item);
      }
    }

    const hasLessons = editLessonPages.some(
      (page) =>
        String(page.title || "").trim() &&
        String(page.content || "").trim()
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
      editDesc.trim() &&
      editSubject.trim() &&
      editLearningObjectives.trim() &&
      hasLessons &&
      hasQuiz;

    const finalStatus = hasRequiredContent ? editStatus : "draft";

    const payload = {
      action: "update",
      id: Number(id),
      title: editTitle.trim(),
      description: editDesc.trim(),
      subject: editSubject.trim(),
      learning_objectives: editLearningObjectives.trim(),
      lesson_content: serializeLessonPages(editLessonPages),
      status: finalStatus,
      quiz_contents: serializeQuizItems(completedQuizItems),
    };

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
      console.log("SAVE RAW RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("PHP did not return valid JSON.");
      }

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `Module successfully saved as ${
            finalStatus === "publish" ? "Published" : "Draft"
          }.`,
          buttonsStyling: false,
        });

        navigate("/admin/modules");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message || "Update failed.",
        });
      }
    } catch (err) {
      console.error("SAVE ERROR:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error updating module.",
      });
    }
  };

  const addLessonPage = () => {
    setEditLessonPages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: `Lesson Page ${prev.length + 1}`,
        content: "",
      },
    ]);
  };

  const updateLessonPage = (index, field, value) => {
    setEditLessonPages((prev) =>
      prev.map((page, i) => (i === index ? { ...page, [field]: value } : page))
    );
  };

  const removeLessonPage = (index) => {
    setEditLessonPages((prev) => prev.filter((_, i) => i !== index));
  };

  const addEditQuizItem = () => {
    setEditQuizItems((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
      },
    ]);
  };

  const updateEditQuizQuestion = (index, value) => {
    setEditQuizItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, question: value } : item))
    );
  };

  const updateEditQuizOption = (itemIndex, optionIndex, value) => {
    setEditQuizItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item;

        const updatedOptions = [...item.options];
        updatedOptions[optionIndex] = value;

        return {
          ...item,
          options: updatedOptions,
        };
      })
    );
  };

  const updateEditCorrectAnswer = (index, value) => {
    setEditQuizItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, correct_answer: value } : item
      )
    );
  };

  const updateEditExplanation = (index, value) => {
    setEditQuizItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, explanation: value } : item
      )
    );
  };

  const removeEditQuizItem = (index) => {
    setEditQuizItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className={styles.gridContainer}>
        <main className={styles.main}>Loading...</main>
      </div>
    );
  }

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
          <h1>Edit Module</h1>
        </div>

        <div className={styles.formCard}>
          <div className={styles.popupInfoGrid}>
            <div className={styles.popupField}>
              <label className={styles.popupLabel}>
                Module Title <span className={styles.required}>*Required</span>
              </label>

              <input
                className={styles.popupInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter module title"
              />
            </div>

            <div className={styles.popupField}>
              <label className={styles.popupLabel}>Status</label>

              <select
                className={styles.popupSelect}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
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
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Enter module description"
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>
              Subject <span className={styles.required}>*Required</span>
            </label>

            <input
              className={styles.popupInput}
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              placeholder="Enter subject"
            />
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
              value={editLearningObjectives}
              onChange={(e) => setEditLearningObjectives(e.target.value)}
              placeholder="Enter learning objectives"
            />
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

            {editLessonPages.length === 0 ? (
              <div className={styles.popupEmptyQuiz}>No lesson pages yet.</div>
            ) : (
              editLessonPages.map((page, index) => (
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
                    onChange={(e) => updateLessonPage(index, "title", e.target.value)}
                    placeholder="Page title"
                  />

                  <textarea
                    className={`${styles.popupTextarea} ${styles.popupLargeBox}`}
                    value={page.content}
                    onChange={(e) => updateLessonPage(index, "content", e.target.value)}
                    placeholder="Page content"
                  />
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
                  onClick={handleGenerateQuizForEdit}
                  disabled={generatingEditQuiz}
                >
                  {generatingEditQuiz ? "Generating..." : "Auto Generate"}
                </button>

                <button
                  type="button"
                  className={styles.popupAddBtn}
                  onClick={addEditQuizItem}
                >
                  Add +
                </button>
              </div>
            </div>

            {editQuizItems.length === 0 ? (
              <div className={styles.popupEmptyQuiz}>No quiz items yet.</div>
            ) : (
              editQuizItems.map((item, index) => (
                <div key={index} className={styles.popupQuizCard}>
                  <div className={styles.popupQuizCardTop}>
                    <span className={styles.popupQuizCardTitle}>
                      Item {index + 1}
                    </span>

                    <button
                      type="button"
                      className={styles.popupRemoveBtn}
                      onClick={() => removeEditQuizItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    className={styles.popupInput}
                    value={item.question}
                    onChange={(e) => updateEditQuizQuestion(index, e.target.value)}
                    placeholder="Question"
                  />

                  <div className={styles.optionsGrid}>
                    {item.options.slice(0, 4).map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        className={styles.popupInput}
                        value={option}
                        onChange={(e) =>
                          updateEditQuizOption(index, optionIndex, e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    ))}
                  </div>

                  <input
                    className={styles.popupInput}
                    value={item.correct_answer}
                    onChange={(e) => updateEditCorrectAnswer(index, e.target.value)}
                    placeholder="Correct Answer"
                  />

                  <textarea
                    className={`${styles.popupTextarea} ${styles.popupAnswerBox}`}
                    value={item.explanation}
                    onChange={(e) => updateEditExplanation(index, e.target.value)}
                    placeholder="Explanation"
                  />
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

            <button className={styles.popupSaveBtn} type="button" onClick={saveEdit}>
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}