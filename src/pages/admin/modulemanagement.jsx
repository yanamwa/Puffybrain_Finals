import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
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

import styles from "./modulemanage.module.css";

/* -----------------------------
   helpers
----------------------------- */
function formatToday() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/* -----------------------------
   STRONG parser
----------------------------- */
function parseDeckCards(raw) {
  if (!raw) return [];
  const text = String(raw).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed
        .map((x, i) => ({
          id: i + 1,
          question: String(x.question ?? x.q ?? "").trim(),
          answer: String(x.answer ?? x.a ?? "").trim(),
        }))
        .filter((c) => c.question || c.answer);
    }
  } catch {}

  const blocks = text
    .split(/\n\s*\n+/g)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length) {
    return blocks.map((block, idx) => {
      const lines = block.split("\n").filter(Boolean);
      return {
        id: idx + 1,
        question: lines[0] || "",
        answer: lines.slice(1).join("\n"),
      };
    });
  }

  const lines = text.split("\n").filter(Boolean);
  const cards = [];
  for (let i = 0; i < lines.length; i += 2) {
    cards.push({
      id: cards.length + 1,
      question: lines[i] || "",
      answer: lines[i + 1] || "",
    });
  }
  return cards;
}

export default function ModuleManagement() {
  const API_URL = "http://localhost/puffybrain/adminLearningModule.php";

  /* -----------------------------
     MENU
  ----------------------------- */
  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <BookOpen size={20} /> },
  ];

  /* -----------------------------
     STATE
  ----------------------------- */
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [rowsToShow, setRowsToShow] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");
  const [lessonText, setLessonText] = useState("");
  const [quizContents, setQuizContents] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("inactive");
  const [editLearning, setEditLearning] = useState("");
  const [editQuiz, setEditQuiz] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const fetchedOnce = useRef(false);

  /* -----------------------------
     FETCH FROM DB
  ----------------------------- */
  const fetchModules = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data?.success && Array.isArray(data.modules)) {
        setModules(
          data.modules.map((m) => ({
            id: m.id,
            title: m.title,
            date: m.created_at ?? formatToday(),
            status: String(m.status).toLowerCase(),
            module_description: m.description ?? "",
            subject_course: m.subject ?? "",
            learningModule: m.lesson_text ?? "",
            quizModule: m.quiz_contents ?? "",
          }))
        );
      } else {
        setModules([]);
      }
    } catch (err) {
      console.error(err);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchModules();
  }, []);

  /* -----------------------------
     MEMOS
  ----------------------------- */
  const filteredModules = useMemo(
    () =>
      modules.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [modules, searchQuery]
  );

  const shownModules = useMemo(
    () => filteredModules.slice(0, rowsToShow),
    [filteredModules, rowsToShow]
  );

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedId) || null,
    [modules, selectedId]
  );

  const selectedCards = useMemo(
    () => (selectedModule ? parseDeckCards(selectedModule.quizModule) : []),
    [selectedModule]
  );

  const editTarget = useMemo(
    () => modules.find((m) => m.id === editId) || null,
    [modules, editId]
  );

  /* -----------------------------
     ACTIONS
  ----------------------------- */
  const openView = (mod) => {
    setSelectedId(mod.id);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewOpen(false);
    setSelectedId(null);
  };

  const openAdd = () => setAddOpen(true);

  const closeAdd = () => {
    setAddOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewSubject("");
    setNewStatus("Draft");
    setLessonText("");
    setQuizContents("");
  };

  /* ✅ FIXED: correct handler */
  const handleAddModule = async () => {
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          subject: newSubject,
          status: newStatus,
          lesson_text: lessonText,
          quiz_contents: quizContents,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Module added successfully!");
        closeAdd();
        fetchModules();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (mod) => {
    setEditId(mod.id);
    setEditTitle(mod.title);
    setEditStatus(mod.status);
    setEditLearning(mod.learningModule);
    setEditQuiz(mod.quizModule);
    setEditOpen(true);
  };

  const closeEdit = () => setEditOpen(false);

  const saveEdit = () => {
    alert("Edit save not connected to DB yet");
    closeEdit();
  };

  const openDelete = (mod) => {
    setDeleteTarget(mod);
    setDeleteOpen(true);
  };

  const closeDelete = () => setDeleteOpen(false);

  const confirmDelete = () => {
    setModules((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    closeDelete();
    setSuccessOpen(true);
  };

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
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

      {/* HEADER */}
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

      {/* MAIN */}
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Module Management</h1>
          <button className={styles.addBtn} type="button" onClick={openAdd}>
            + Add new module
          </button>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Module ID</th>
                <th>Module Title</th>
                <th>Date created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Loading modules...
                  </td>
                </tr>
              ) : shownModules.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No modules found.
                  </td>
                </tr>
              ) : (
                shownModules.map((mod) => (
                  <tr key={mod.id}>
                    <td>{mod.id}</td>
                    <td>{mod.title}</td>
                    <td>{mod.date}</td>

                    <td>
                      <span
                        className={
                          mod.status === "active"
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        ● {mod.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className={styles.actions}>
                      <button className={styles.actionEdit} type="button" onClick={() => openEdit(mod)}>
                        ✎ <span>edit</span>
                      </button>
                      <button className={styles.actionDelete} type="button" onClick={() => openDelete(mod)}>
                        🗑 <span>delete</span>
                      </button>
                      <button className={styles.actionView} type="button" onClick={() => openView(mod)}>
                        👁 <span>view</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION (UI only) */}
          <div className={styles.paginationWrapper}>
            <div className={styles.paginationCenter}>
              <button className={styles.navBtn} type="button">
                {"<"}
              </button>

              <button className={`${styles.pageBtn} ${styles.pageActive}`} type="button">
                1
              </button>
              <button className={styles.pageBtn} type="button">
                2
              </button>
              <button className={styles.pageBtn} type="button">
                3
              </button>

              <span className={styles.dots}>...</span>

              <button className={styles.pageBtn} type="button">
                10
              </button>

              <button className={styles.navBtn} type="button">
                {">"}
              </button>
            </div>

            <div className={styles.rowsControl}>
              <span>Show</span>
              <select
                value={rowsToShow}
                onChange={(e) => setRowsToShow(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>Row</span>
            </div>
          </div>
        </div>
      </main>

      {/* =========================
          ✅ VIEW MODAL (Module Details)
         ========================= */}
      {viewOpen && selectedModule && (
        <div className={styles.mmOverlay} onClick={closeView}>
          <div className={styles.mmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mmHeader}>
              <h2 className={styles.mmTitle}>Module Details:</h2>

              <button
                type="button"
                className={styles.mmHeaderEdit}
                onClick={() => openEdit(selectedModule)}
              >
                Edit
              </button>

              <button type="button" className={styles.mmClose} onClick={closeView}>
                ✕
              </button>
            </div>

            <div className={styles.mmBody}>
              <div className={styles.mmDetails}>
                <div className={styles.mmCol}>
                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabel}>Module Title</div>
                    <div className={styles.mmValue}>{selectedModule.title || "—"}</div>
                  </div>

                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabel}>Module Description</div>
                    <div className={styles.mmValue}>
                      {selectedModule.module_description?.trim()
                        ? selectedModule.module_description
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className={styles.mmCol}>
                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabel}>Deck Title</div>
                    <div className={styles.mmValue}>{selectedModule.title || "—"}</div>
                  </div>

                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabel}>Deck Description</div>
                    <div className={styles.mmValue}>
                      {selectedModule.module_description?.trim()
                        ? selectedModule.module_description
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.mmDecksTitle}>Module decks</div>

              {selectedCards.length > 0 ? (
                selectedCards.map((c) => (
                  <div key={c.id} className={styles.mmCard}>
                    <div className={styles.mmQ}>{c.question || "—"}</div>
                    <div className={styles.mmA}>{c.answer || "—"}</div>
                  </div>
                ))
              ) : (
                <div className={styles.mmCard}>
                  <div className={styles.mmQ}>No decks yet</div>
                  <div className={styles.mmA}>—</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ✅ ADD MODAL
         ========================= */}
      {addOpen && (
        <div className={styles.addOverlay} onClick={closeAdd}>
          <div className={styles.addModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.addHeader}>
              <h2 className={styles.addHeaderTitle}>Add New Module</h2>
            </div>

            <div className={styles.addBody}>
              <div className={styles.addBodyInner}>
                <label className={styles.addLabel}>Module Title</label>
                <input
                  className={styles.addInput}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter module title"
                />

                <label className={styles.addLabel}>Module Description</label>
                <textarea
                  className={styles.addTextarea}
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Enter module description"
                />

                <label className={styles.addLabel}>Subject / Course</label>
                <input
                  className={styles.addInput}
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. IT 101 / Web Dev"
                />

                <label className={styles.addLabel}>Status</label>
                <select
                  className={styles.addInput}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Publish">Publish</option>
                </select>

                <label className={styles.addLabel}>Lesson Text Contents</label>
                <textarea
                  className={styles.addTextarea}
                  rows={4}
                  value={lessonText}
                  onChange={(e) => setLessonText(e.target.value)}
                  placeholder="Paste or type lesson text contents here..."
                />

                <label className={styles.addLabel}>Quiz/Cards Contents</label>
                <textarea
                  className={styles.addTextarea}
                  rows={4}
                  value={quizContents}
                  onChange={(e) => setQuizContents(e.target.value)}
                  placeholder="Paste or type quiz/cards contents here..."
                />

                <div className={styles.addDivider} />

                <div className={styles.addActions}>
                  <button className={styles.addCancelBtn} type="button" onClick={closeAdd}>
                    Cancel
                  </button>
                <button
  className={styles.addConfirmBtn}
  type="button"
  onClick={handleAddModule}
>
  Add
</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ✅ EDIT MODAL
         ========================= */}
      {editOpen && editTarget && (
        <div className={styles.editOverlay} onClick={closeEdit}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editHeader}>
              <h2 className={styles.editHeaderTitle}>Edit Module</h2>
            </div>

            <div className={styles.editBody}>
              <label className={styles.editLabel}>Module ID</label>
              <input className={styles.editInput} value={editTarget.id} disabled />

              <label className={styles.editLabel}>Module Title</label>
              <input
                className={styles.editInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <label className={styles.editLabel}>Date created</label>
              <input className={styles.editInput} value={editTarget.date} disabled />

              <label className={styles.editLabel}>Status</label>
              <select
                className={styles.editInput}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>

              <label className={styles.editLabel}>Learning Module</label>
              <textarea
                className={styles.editTextarea}
                rows={4}
                value={editLearning}
                onChange={(e) => setEditLearning(e.target.value)}
                placeholder="Paste or type lesson contents here..."
              />

              <label className={styles.editLabel}>Quiz Module</label>
              <textarea
                className={styles.editTextarea}
                rows={4}
                value={editQuiz}
                onChange={(e) => setEditQuiz(e.target.value)}
                placeholder="Paste or type quiz/cards contents here..."
              />

              <div className={styles.editDivider} />

              <div className={styles.editActions}>
                <button className={styles.editCancelBtn} type="button" onClick={closeEdit}>
                  Cancel
                </button>
                <button className={styles.editConfirmBtn} type="button" onClick={saveEdit}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ✅ DELETE MODAL
         ========================= */}
      {deleteOpen && deleteTarget && (
        <div className={styles.alertOverlay} onClick={closeDelete}>
          <div className={styles.alertModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.alertText}>
              Are you sure you want to delete this module?
              <br />
              <span>This cannot be undo.</span>
            </p>

            <div className={styles.alertActions}>
              <button className={styles.alertCancelBtn} type="button" onClick={closeDelete}>
                Cancel
              </button>
              <button className={styles.alertConfirmBtn} type="button" onClick={confirmDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {successOpen && (
        <div className={styles.successOverlay} onClick={() => setSuccessOpen(false)}>
          <div className={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.successText}>Deleted successfully</p>
            <button
              className={styles.successBtn}
              type="button"
              onClick={() => setSuccessOpen(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}