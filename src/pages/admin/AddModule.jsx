import React, { useRef, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

export default function AddModule() {
  const navigate = useNavigate();

  const API_URL = "http://localhost/puffybrain/adminLearningModule.php";
  const AI_API_URL = "http://localhost/puffybrain/generateQuiz.php";
  const EXTRACT_API_URL = "http://localhost/puffybrain/processLessonFile.php";

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

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newLearningObjectives, setNewLearningObjectives] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");
  const [newQuizItems, setNewQuizItems] = useState([]);
  const [generatingNewQuiz, setGeneratingNewQuiz] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractingFile, setExtractingFile] = useState(false);

  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleUploadAndExtract = async () => {
    if (!uploadedFile) {
      await Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please choose a PDF, DOCX, or TXT file first.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    setExtractingFile(true);

    Swal.fire({
      title: "Extracting Module...",
      text: "Please wait while the file is being processed.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(EXTRACT_API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      Swal.close();

      if (!data.success) {
        throw new Error(data.message || "Could not extract module content.");
      }

      setNewTitle(data.module_title || "");
      setNewSubject(data.subject || "");
      setNewDesc(data.description || "");
      setNewLearningObjectives(data.learning_objectives || "");
      setNewLessonContent(data.lesson_content || "");

      await Swal.fire({
        icon: "success",
        title: "Extracted",
        text: "The file content was added to the form.",
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
        lesson_title: newTitle,
        learning_objectives: newLearningObjectives,
        lesson_content: newLessonContent,
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
    if (!newLearningObjectives.trim() && !newLessonContent.trim()) {
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

  const handleAddModule = async () => {
    if (!newTitle.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Title",
        text: "Module title is required.",
      });
      return;
    }

    const payload = {
      title: newTitle,
      description: newDesc,
      subject: newSubject,
      learning_objectives: newLearningObjectives,
      lesson_content: newLessonContent,
      status: newStatus,
      quiz_contents: serializeQuizItems(newQuizItems),
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
          title: "Added!",
          text: "Module added successfully.",
        });
        navigate("/admin/modules");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Add Failed",
          text: data.message || "Failed to add module.",
        });
      }
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error adding module.",
      });
    }
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
      prev.map((item, i) =>
        i === index ? { ...item, question: value } : item
      )
    );
  };

  const updateNewQuizOption = (itemIndex, optionIndex, value) => {
    setNewQuizItems((prev) =>
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
          <h1>Add Module</h1>
        </div>

        <div className={styles.popupBody}>
          <div className={styles.popupInfoGrid}>
            <div className={styles.popupField}>
              <label className={styles.popupLabel}>Module Title</label>
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
                <option value="Draft">Draft</option>
                <option value="Publish">Publish</option>
              </select>
            </div>
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Module Description</label>
            <textarea
              className={`${styles.popupTextarea} ${styles.popupSmallBox}`}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Subject</label>
            <input
              className={styles.popupInput}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Upload Lesson File</label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
              />

              <button
                type="button"
                className={styles.popupAddBtn}
                onClick={handleUploadAndExtract}
                disabled={extractingFile}
              >
                {extractingFile ? "Extracting..." : "Upload and Extract"}
              </button>
            </div>
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Learning Objectives</label>
            <textarea
              className={`${styles.popupTextarea} ${styles.popupSmallBox}`}
              value={newLearningObjectives}
              onChange={(e) => setNewLearningObjectives(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <label className={styles.popupLabel}>Lessons</label>
            <textarea
              className={`${styles.popupTextarea} ${styles.popupLargeBox}`}
              value={newLessonContent}
              onChange={(e) => setNewLessonContent(e.target.value)}
            />
          </div>

          <div className={styles.popupSection}>
            <div className={styles.popupSectionRow}>
              <label className={styles.popupLabel}>Quiz Module</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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