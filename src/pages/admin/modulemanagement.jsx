
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

/* ✅ STRONG parser: JSON / Q:A / blank blocks / 2-lines */
function parseDeckCards(raw) {
  if (!raw) return [];
  const text = String(raw).trim();
  if (!text) return [];

  // 1) JSON array
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      const cards = parsed
        .map((x, i) => ({
          id: i + 1,
          question: String(x.question ?? x.q ?? "").trim(),
          answer: String(x.answer ?? x.a ?? "").trim(),
        }))
        .filter((c) => c.question || c.answer);
      if (cards.length) return cards;
    }
  } catch (_) {}

  // 2) Q:/A: format
  if (/^\s*Q\s*:/im.test(text) || /^\s*A\s*:/im.test(text)) {
    const lines = text.split("\n");
    const cards = [];
    let q = "";
    let a = "";

    const push = () => {
      const qq = q.trim();
      const aa = a.trim();
      if (qq || aa) cards.push({ id: cards.length + 1, question: qq, answer: aa });
      q = "";
      a = "";
    };

    for (const line of lines) {
      if (/^\s*Q\s*:/i.test(line)) {
        if (q || a) push();
        q = line.replace(/^\s*Q\s*:\s*/i, "");
      } else if (/^\s*A\s*:/i.test(line)) {
        a = line.replace(/^\s*A\s*:\s*/i, "");
      } else {
        if (a) a += "\n" + line;
        else q += (q ? "\n" : "") + line;
      }
    }
    push();
    return cards;
  }

  // 3) blank-line blocks
  const blocks = text
    .split(/\n\s*\n+/g)
    .map((b) => b.trim())
    .filter(Boolean);

  const fromBlocks = blocks
    .map((block, idx) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      return {
        id: idx + 1,
        question: lines[0] || "",
        answer: lines.slice(1).join("\n").trim(),
      };
    })
    .filter((c) => c.question || c.answer);

  if (fromBlocks.length) return fromBlocks;

  // 4) fallback: every 2 lines = Q/A
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const cards = [];
  for (let i = 0; i < lines.length; i += 2) {
    cards.push({
      id: cards.length + 1,
      question: lines[i] || "",
      answer: lines[i + 1] || "",
    });
  }
  return cards.filter((c) => c.question || c.answer);
}

export default function ModuleManagement() {
  const API_URL = "http://localhost/puffybrain/adminLearningModule.php";
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // header search
  const [searchQuery, setSearchQuery] = useState("");

  // profile dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // pagination UI only
  const [rowsToShow, setRowsToShow] = useState(10);

  // ✅ VIEW: store ID only (prevents stale object issues)
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ADD modal
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");
  const [lessonText, setLessonText] = useState("");
  const [quizContents, setQuizContents] = useState("");

  // EDIT modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("inactive");
  const [editLearning, setEditLearning] = useState("");
  const [editQuiz, setEditQuiz] = useState("");

  // DELETE modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // SUCCESS modal
  const [successOpen, setSuccessOpen] = useState(false);

  // ✅ fallback data (same IDs)
  const fallbackData = [
    {
      id: "QZ2025A01",
      title: "rairai",
      date: "10/11/2025",
      status: "active",
      module_description: "Sample module description",
      subject_course: "IT 101 / Web Dev",
      learningModule: "Learning module sample...",
      quizModule: `What is the primary purpose of a "router" in a home network?
To forward data between different networks, such as your home network and the internet.

Which network device is used to amplify a Wi-Fi signal to extend the coverage area of a wireless network?
A Wi-Fi Repeater/Extender

What does the acronym "LAN" commonly stand for?
Local Area Network`,
    },
    { id: "BK06A2025", title: "Paps", date: "11/27/2025", status: "active", module_description: "", subject_course: "", learningModule: "", quizModule: "" },
    { id: "BK07A2025", title: "Larah", date: "12/17/2025", status: "active", module_description: "", subject_course: "", learningModule: "", quizModule: "" },
    { id: "BK08A2025", title: "meiko", date: "11/22/2025", status: "active", module_description: "", subject_course: "", learningModule: "", quizModule: "" },
    { id: "BK09A2025", title: "jessy", date: "11/16/2025", status: "inactive", module_description: "", subject_course: "", learningModule: "", quizModule: "" },
  ];

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Users size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <BookOpen size={20} /> },
  ];

  /* FETCH DATA */
  const fetchModules = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) setModules(data.modules);
      else setModules([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
  console.log("Add button clicked!"); // confirms button is working
  if (!newTitle.trim()) return;

  try {
    const response = await fetch(API_URL, {  // <-- use API_URL here
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        subject: newSubject,
        status: newStatus,
        lesson_text: lessonText,
        quiz_contents: quizContents,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Module added successfully!");
      closeAddModal();
      fetchModules(); 
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error adding module:", error);
  }
};
  /* -----------------------------
     ✅ FETCH (guarded for StrictMode)
  ----------------------------- */
  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    const fetchModules = async () => {
      try {
        const res = await fetch("http://localhost/puffybrain/adminLearningModule.php");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();

        if (data?.success && Array.isArray(data.modules)) {
          const normalized = data.modules.map((m) => ({
            id: m.id ?? m.module_id ?? m.moduleId ?? `MD${Date.now()}`,
            title: m.title ?? m.module_title ?? m.moduleTitle ?? "",
            date: m.date ?? m.date_created ?? m.created_at ?? formatToday(),
            status: String(m.status ?? "inactive").toLowerCase(),

            module_description: m.module_description ?? m.description ?? "",
            subject_course: m.subject_course ?? m.subject ?? m.course ?? "",

            learningModule:
              m.learningModule ??
              m.lesson_text_contents ??
              m.lesson_contents ??
              m.lesson ??
              "",

            quizModule:
              m.quizModule ??
              m.quiz_cards_contents ??
              m.quiz_contents ??
              m.quiz ??
              m.deck_cards ??
              "",
          }));

          setModules(normalized.length ? normalized : fallbackData);
        } else {
          setModules(fallbackData);
        }
      } catch (e) {
        console.error(e);
        setModules(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* CLOSE DROPDOWN OUTSIDE */
  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* -----------------------------
     memo computed
  ----------------------------- */
  const filteredModules = useMemo(() => {
    return modules.filter((m) =>
      String(m.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modules, searchQuery]);

  const shownModules = useMemo(() => {
    return filteredModules.slice(0, rowsToShow);
  }, [filteredModules, rowsToShow]);

  const selectedModule = useMemo(() => {
    return modules.find((m) => m.id === selectedId) || null;
  }, [modules, selectedId]);

  const selectedCards = useMemo(() => {
    return selectedModule ? parseDeckCards(selectedModule.quizModule) : [];
  }, [selectedModule]);

  const editTarget = useMemo(() => {
    return modules.find((m) => m.id === editId) || null;
  }, [modules, editId]);

  /* -----------------------------
     VIEW
  ----------------------------- */
  const openView = (mod) => {
    setSelectedId(mod.id);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewOpen(false);
    setSelectedId(null);
  };

  /* -----------------------------
     ADD
  ----------------------------- */
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



  const handleAdd = () => {
    if (!newTitle.trim()) return;

    const item = {
      id: `MD${Date.now()}`,
      title: newTitle.trim(),
      date: formatToday(),
      status: newStatus === "Publish" ? "active" : "inactive",
      module_description: newDesc.trim(),
      subject_course: newSubject.trim(),
      learningModule: lessonText.trim(),
      quizModule: quizContents.trim(),
    };

    setModules((prev) => [item, ...prev]);
    closeAdd();
  };

  /* -----------------------------
     EDIT
  ----------------------------- */
  const openEdit = (mod) => {
    setEditId(mod.id);
    setEditTitle(mod.title || "");
    setEditStatus(String(mod.status || "inactive").toLowerCase());
    setEditLearning(mod.learningModule || "");
    setEditQuiz(mod.quizModule || "");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditId(null);
    setEditTitle("");
    setEditStatus("inactive");
    setEditLearning("");
    setEditQuiz("");
  };

  const saveEdit = () => {
    if (!editTarget) return;
    const title = editTitle.trim();
    if (!title) return;

    setModules((prev) =>
      prev.map((m) =>
        m.id === editTarget.id
          ? {
              ...m,
              title,
              status: editStatus,
              learningModule: editLearning.trim(),
              quizModule: editQuiz.trim(),
            }
          : m
      )
    );

    closeEdit();
  };

  /* -----------------------------
     DELETE
  ----------------------------- */
  const openDelete = (mod) => {
    setDeleteTarget(mod);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setModules((prev) => prev.filter((m) => m.id !== deleteTarget.id));

    if (selectedId === deleteTarget.id) {
      closeView();
    }

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
                  <button className={styles.addConfirmBtn} type="button" onClick={handleAdd}>
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