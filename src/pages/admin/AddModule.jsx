import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
import styles from "./Addmodule.module.css";
import "boxicons/css/boxicons.min.css";

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

export default function AddModule() {
  const navigate = useNavigate();

  const API_URL = "http://localhost/puffybrain/adminLearningModule.php";
  const AI_API_URL = "http://localhost/puffybrain/generateQuiz.php";
  const EXTRACT_API_URL = "http://localhost/puffybrain/processLessonFile.php";

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

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      label: "Module Management",
      path: "/admin/modules",
      icon: <Layers size={20} />,
    },
    {
      label: "Decks Management",
      path: "/admin/decks",
      icon: <LibraryBig size={20} />,
    },
    {
      label: "Modes Management",
      path: "/admin/modes",
      icon: <Gamepad2 size={20} />,
    },
    {
      label: "Notification Management",
      path: "/admin/notifications",
      icon: <i className="bx bx-bell"></i>,
    },
    {
      label: "Backup & Restore",
      path: "/admin/backup-restore",
      icon: <Database size={20} />,
    },
  ];

  const handleLogout = (e) => {
    e.preventDefault();

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/admin/login";
  };

  const fetchAdmin = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getAdminProfile.php", {
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
        profile_image:
          data.admin?.profile_image || "/images/temporary profile.jpg",
      });
    } catch (err) {
      console.error("Fetch admin error:", err);
    }
  };

  const fetchBellNotifications = async () => {
    try {
      const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");

      const res = await fetch(
        `http://localhost/puffybrain/getAdminNotifications.php?admin_id=${
          storedAdmin.id || ""
        }`,
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
      const res = await fetch(
        "http://localhost/puffybrain/markAdminNotificationsRead.php",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ admin_id: adminId }),
        }
      );

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

      setNewTitle(data.module_title || "");
      setNewSubject(data.subject || "");
      setNewDesc(data.description || "");
      setNewLearningObjectives(data.learning_objectives || "");

      const pages =
        Array.isArray(data.lesson_pages) && data.lesson_pages.length > 0
          ? data.lesson_pages.map((page, index) => ({
              id: index + 1,
              title: String(page.title || `Lesson Page ${index + 1}`).trim(),
              content: String(page.content || "").trim(),
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
      headers: { "Content-Type": "application/json" },
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

    return questions.map((item, index) => ({
      id: index + 1,
      question: String(item.question || "").trim(),
      options: Array.isArray(item.options)
        ? [...item.options, "", "", "", ""].slice(0, 4)
        : ["", "", "", ""],
      correct_answer: String(
        item.correct_answer || item.correctAnswer || ""
      ).trim(),
      explanation: String(item.explanation || "").trim(),
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
              <small>Maximum: 100 questions only</small>
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
    const res = await fetch("http://localhost/puffybrain/generateOptions.php", {
      method: "POST",
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
          if (!newLearningObjectives.trim())
            missingFields.push("• Learning Objectives");
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

  const addLessonPage = () => {
    setNewLessonPages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: `Lesson Page ${prev.length + 1}`,
        content: "",
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

  const addNewQuizItem = () => {
    setNewQuizItems((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
      },
    ]);
  };

  const updateNewQuizQuestion = (index, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, question: value } : item))
    );
  };

  const updateNewQuizOption = (itemIndex, optionIndex, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item;

        const updatedOptions = [...item.options];
        updatedOptions[optionIndex] = value;

        return { ...item, options: updatedOptions };
      })
    );
  };

  const updateNewCorrectAnswer = (index, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, correct_answer: value } : item
      )
    );
  };

  const updateNewExplanation = (index, value) => {
    setNewQuizItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, explanation: value } : item
      )
    );
  };

  const removeNewQuizItem = (index) => {
    setNewQuizItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.gridContainer}>
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.sidebarTop}>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img
              className={styles.logoExpanded}
              src="/images/logo1.png"
              alt="Logo"
            />

            <img
              className={styles.logoCollapsed}
              src="/images/logo_solo.png"
              alt="Logo"
            />
          </div>

          <div className={styles.divider}></div>

          <p className={styles.menuLabel}>Menu</p>

          <nav className={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuText}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.divider}></div>

          <p className={styles.menuLabel}>Others</p>

          <nav className={styles.menu}>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <User size={20} />
              </span>
              <span className={styles.menuText}>Profile</span>
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <Settings size={20} />
              </span>
              <span className={styles.menuText}>Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.divider}></div>

          <NavLink to="/admin/login" onClick={handleLogout} className={styles.menuItem}>
            <span className={styles.menuIcon}>
              <LogOut size={20} />
            </span>
            <span className={styles.menuText}>Logout</span>
          </NavLink>
        </div>
      </aside>

      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={19} />

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.headerRight}>
          <div className={styles.notificationWrapper}>
            <button
              type="button"
              className={styles.notificationBtn}
              onClick={(e) => {
                e.stopPropagation();
                setNotificationOpen((prev) => !prev);
              }}
            >
              <i className="bx bx-bell"></i>

              {notificationCount > 0 && (
                <span className={styles.notificationBadge}>
                  {notificationCount}
                </span>
              )}
            </button>

            <div
              className={`${styles.notificationDropdown} ${
                notificationOpen ? styles.show : ""
              }`}
            >
              <div className={styles.notificationHeader}>
                <h4>Notifications</h4>

                {notificationCount > 0 && (
                  <button
                    type="button"
                    className={styles.markReadBtn}
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {bellNotifications.length > 0 ? (
                bellNotifications.slice(0, 5).map((item) => (
                  <div
                    key={item.notification_id || item.id}
                    className={styles.notificationItem}
                  >
                    <div className={styles.notificationTop}>
                      <h5>{item.title || "No title"}</h5>
                      <span className={styles.notificationRole}>
                        {item.recipient_type || "all"}
                      </span>
                    </div>

                    <p className={styles.notificationMessage}>
                      {item.message || "No message"}
                    </p>

                    <p className={styles.notificationCreator}>
                      Posted by {item.created_by || "Admin"}
                    </p>

                    <small className={styles.notificationDate}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "No date"}
                    </small>
                  </div>
                ))
              ) : (
                <div className={styles.emptyNotification}>
                  <p>You don’t have any new notifications</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.adminHeaderProfile}>
            <img
              src={admin.profile_image || "/images/temporary profile.jpg"}
              alt="Admin"
              className={styles.adminHeaderImg}
            />

            <span className={styles.adminHeaderName}>
              {admin.username || "Admin"}
            </span>
          </div>
        </div>
      </header>

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
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter module title"
              />
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
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Enter module description"
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>
              Subject <span className={styles.required}>*Required</span>
            </label>

            <input
              className={styles.popupInput}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
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
              value={newLearningObjectives}
              onChange={(e) => setNewLearningObjectives(e.target.value)}
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
                    onChange={(e) =>
                      updateNewQuizQuestion(index, e.target.value)
                    }
                    placeholder="Question"
                  />

                  <div className={styles.optionsGrid}>
                    {item.options.map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        className={styles.popupInput}
                        value={option}
                        onChange={(e) =>
                          updateNewQuizOption(
                            index,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    ))}
                  </div>

                  <input
                    className={styles.popupInput}
                    value={item.correct_answer}
                    onChange={(e) =>
                      updateNewCorrectAnswer(index, e.target.value)
                    }
                    placeholder="Correct Answer"
                  />

                  <textarea
                    className={`${styles.popupTextarea} ${styles.popupAnswerBox}`}
                    value={item.explanation}
                    onChange={(e) =>
                      updateNewExplanation(index, e.target.value)
                    }
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