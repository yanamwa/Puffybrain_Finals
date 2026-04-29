import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  Search,
  User,
  ChevronDown,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./modulemanage.module.css";

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
        correct_answer: String(
          x.correct_answer || x.correctAnswer || ""
        ).trim(),
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

export default function EditModule() {
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = "http://localhost/puffybrain/adminLearningModule.php";
  const AI_API_URL = "http://localhost/puffybrain/generateQuiz.php";

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
      icon: <BookOpen size={20} />,
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editLearningObjectives, setEditLearningObjectives] = useState("");
  const [editLessonContent, setEditLessonContent] = useState("");
  const [editStatus, setEditStatus] = useState("inactive");
  const [editQuizItems, setEditQuizItems] = useState([]);
  const [generatingEditQuiz, setGeneratingEditQuiz] = useState(false);

  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(API_URL);
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
          setEditLessonContent(mod.lesson_content || "");
          setEditStatus(String(mod.status || "inactive").toLowerCase());
          setEditQuizItems(parseDeckCards(mod.quiz_contents));
        }
      } catch (err) {
        console.error(err);
        await Swal.fire({
          icon: "error",
          title: "Load Failed",
          text: "Could not fetch module.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id, navigate]);

  const generateQuizFromAI = async ({
    questionCount = 5,
    difficulty = "medium",
  }) => {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lesson_title: editTitle,
        learning_objectives: editLearningObjectives,
        lesson_content: editLessonContent,
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

  const handleGenerateQuizForEdit = async () => {
    if (!editLearningObjectives.trim() && !editLessonContent.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Content",
        text: "Please enter learning objectives or lesson content first.",
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

    setGeneratingEditQuiz(true);

    try {
      const quizItems = await generateQuizFromAI({
        questionCount: formValues.questionCount,
        difficulty: formValues.difficulty,
      });

      setEditQuizItems(quizItems);

      await Swal.fire({
        icon: "success",
        title: "Quiz Generated",
        text: `${quizItems.length} quiz item(s) generated successfully.`,
      });
    } catch (err) {
      console.error("AI GENERATE EDIT ERROR:", err);
      await Swal.fire({
        icon: "error",
        title: "Generation Failed",
        text: err.message || "Something went wrong while generating quiz.",
      });
    } finally {
      setGeneratingEditQuiz(false);
    }
  };

  const saveEdit = async () => {
    const payload = {
      action: "update",
      id,
      title: editTitle,
      description: editDesc,
      subject: editSubject,
      learning_objectives: editLearningObjectives,
      lesson_content: editLessonContent,
      status: editStatus,
      quiz_contents: serializeQuizItems(editQuizItems),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Module updated successfully.",
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
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating module.",
      });
    }
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
      prev.map((item, i) =>
        i === index ? { ...item, question: value } : item
      )
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
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/images/logo1.png" alt="Logo" />
        </div>

        <div className={styles.menuLabel}>Menu</div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ""}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} type="button">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <div className={styles.profileIcon}>
            <User size={20} />
          </div>
          <span className={styles.profileName}>@admin</span>

          <button
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen((v) => !v)}
            type="button"
          >
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownContent}>
              <button className={styles.dropdownItem} type="button">
                <Settings size={16} /> Settings
              </button>
              <button className={styles.dropdownItem} type="button">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Edit Module</h1>
        </div>

        <div className={styles.popupBody}>
          <div className={styles.popupInfoGrid}>
            <div className={styles.popupField}>
              <label className={styles.popupLabel}>Module Title</label>
              <input
                className={styles.popupInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className={styles.popupField}>
              <label className={styles.popupLabel}>Status</label>
              <select
                className={styles.popupSelect}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Module Description</label>
            <textarea
              className={`${styles.popupTextarea} ${styles.popupSmallBox}`}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Subject</label>
            <input
              className={styles.popupInput}
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Learning Objectives</label>
            <textarea
              className={`${styles.popupTextarea} ${styles.popupSmallBox}`}
              value={editLearningObjectives}
              onChange={(e) => setEditLearningObjectives(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Lessons</label>
            <textarea
              className={`${styles.popupTextarea} ${styles.popupLargeBox}`}
              value={editLessonContent}
              onChange={(e) => setEditLessonContent(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <div className={styles.popupSectionRow}>
              <label className={styles.popupLabel}>Quiz Module</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                    onChange={(e) =>
                      updateEditQuizQuestion(index, e.target.value)
                    }
                    placeholder="Question"
                  />

                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    {item.options.map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        className={styles.popupInput}
                        value={option}
                        onChange={(e) =>
                          updateEditQuizOption(
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
                      updateEditCorrectAnswer(index, e.target.value)
                    }
                    placeholder="Correct Answer"
                  />

                  <textarea
                    className={`${styles.popupTextarea} ${styles.popupAnswerBox}`}
                    value={item.explanation}
                    onChange={(e) =>
                      updateEditExplanation(index, e.target.value)
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
              onClick={saveEdit}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}