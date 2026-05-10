import React, { useState } from "react";
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
  const notificationCount = 0;

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
  ];

  const handleLogout = (e) => {
    e.preventDefault();

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/admin/login";
  };

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
      text: "This will replace the current title, description, subject, objectives, and lesson pages with the uploaded file content.",
      showCancelButton: true,
      confirmButtonText: "Yes, replace it",
      cancelButtonText: "Cancel",
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
    return newLessonPages
      .map((page, index) => `Page ${index + 1}: ${page.title}\n${page.content}`)
      .join("\n\n");
  };

  const generateQuizFromAI = async ({ questionCount = 5, difficulty = "medium" }) => {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson_title: newTitle,
        learning_objectives: newLearningObjectives,
        lesson_content: getLessonContentForAI(),
        question_count: questionCount,
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
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "Generate Quiz",
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
          <label for="swal-question-count">How many questions?</label>
          <input id="swal-question-count" type="number" min="1" max="50" value="5" class="swal2-input" style="margin:0;" />

          <label for="swal-difficulty">Difficulty</label>
          <select id="swal-difficulty" class="swal2-select" style="margin:0;">
            <option value="easy">Easy</option>
            <option value="medium" selected>Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Generate",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const questionCount = Number(
          document.getElementById("swal-question-count").value
        );
        const difficulty = document.getElementById("swal-difficulty").value;

        if (!questionCount || questionCount < 1 || questionCount > 50) {
          Swal.showValidationMessage(
            "Please enter a valid number between 1 and 50."
          );
          return false;
        }

        return { questionCount, difficulty };
      },
    });

    if (!formValues) return;

    setGeneratingNewQuiz(true);

    try {
      const quizItems = await generateQuizFromAI({
        questionCount: formValues.questionCount,
        difficulty: formValues.difficulty,
      });

      setNewQuizItems(quizItems);

      await Swal.fire({
        icon: "success",
        title: "Quiz Generated",
        text: `${quizItems.length} quiz item(s) generated successfully.`,
      });
    } catch (err) {
      console.error("AI GENERATE NEW ERROR:", err);

      await Swal.fire({
        icon: "error",
        title: "Generation Failed",
        text: err.message || "Something went wrong while generating quiz.",
      });
    } finally {
      setGeneratingNewQuiz(false);
    }
  };

  const generateOptionsForItem = async (item) => {
  const res = await fetch(
    "http://localhost/puffybrain/generateOptions.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: item.question,
        correct_answer: item.correct_answer,
      }),
    }
  );

  const data = await res.json();

  if (!data.success || !Array.isArray(data.options)) {
    throw new Error(data.message || "Could not generate options.");
  }

  return {
    ...item,
    options: data.options.slice(0, 4),
  };
};

  const handleAddModule = async () => {
    if (!newTitle.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Title",
        text: "Module title is required.",
      });
      return;
    }

    const hasLessons = newLessonPages.some(
      (page) => page.title.trim() && page.content.trim()
    );

    const hasQuiz = newQuizItems.some(
      (item) =>
        item.question.trim() &&
        item.correct_answer.trim() &&
        item.options.some((opt) => opt.trim())
    );

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
      quiz_contents: serializeQuizItems(newQuizItems),
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
    await Swal.fire({
      icon: "warning",
      title: "Incomplete Input",
      text: "Some required module content is missing. Module was automatically saved as Draft.",
    });
  } else {
    await Swal.fire({
      icon: "success",
      title: "Added!",
      text: `Module successfully saved as ${
        finalStatus === "publish" ? "Published" : "Draft"
      }.`,
    });
  }
  navigate("/admin/modules");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Add Failed",
          text: data.message || "Failed to add module.",
        });
      }
    } catch (err) {
      console.error("ADD ERROR:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error adding module.",
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
            <h4>Notifications</h4>

            <div className={styles.emptyNotification}>
              <p>You don’t have any new notifications</p>
            </div>
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
            <label className={styles.popupLabel}>Subject</label>

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