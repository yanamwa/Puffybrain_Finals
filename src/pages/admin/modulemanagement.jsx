
import React, { useState, useRef, useEffect } from "react";
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

export default function ModuleManagement() {
  const API_URL = "http://localhost/puffybrain/adminLearningModule.php";
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // VIEW modal (existing)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // ADD modal (updated)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");

  // ✅ NEW FIELDS
  const [lessonText, setLessonText] = useState("");
  const [quizContents, setQuizContents] = useState("");

  // header search
  const [searchQuery, setSearchQuery] = useState("");

  // profile dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fallbackData = [
    { id: "QZ2025A01", title: "rairai", date: "10/11/2025", status: "active" },
    { id: "BK06A2025", title: "Paps", date: "11/27/2025", status: "active" },
    { id: "BK07A2025", title: "Larah", date: "12/17/2025", status: "active" },
    { id: "BK08A2025", title: "meiko", date: "11/22/2025", status: "active" },
    { id: "BK09A2025", title: "jessy", date: "11/16/2025", status: "inactive" },
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

  /* CLOSE DROPDOWN */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredModules = modules.filter((mod) =>
    (mod.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeAddModal = () => {
    setAddModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewSubject("");
    setNewStatus("Draft");
    setLessonText("");
    setQuizContents("");
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
            onClick={() => setDropdownOpen(!dropdownOpen)}
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
        <div className={styles.header}>
          <h1>Module Management</h1>

          <button
            className={styles.addBtn}
            onClick={() => setAddModalOpen(true)}
            type="button"
          >
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
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Loading modules...
                  </td>
                </tr>
              ) : filteredModules.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No modules found.
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod) => (
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
                        ● {mod.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button className={styles.edit} type="button">
                        Edit
                      </button>
                      <button className={styles.delete} type="button">
                        Delete
                      </button>
                      <button
                        className={styles.view}
                        type="button"
                        onClick={() => {
                          setSelectedModule(mod);
                          setModalOpen(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className={styles.paginationWrapper}>
            <div className={styles.paginationCenter}>
              <button className={styles.navBtn} type="button">
                {"<"}
              </button>
              <button className={`${styles.pageBtn} ${styles.active}`} type="button">
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
              <select>
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span>Row</span>
            </div>
          </div>
        </div>
      </main>

      {/* =========================
          ✅ ADD NEW MODULE MODAL (updated)
         ========================= */}
      {addModalOpen && (
        <div className={styles.addOverlay} onClick={closeAddModal}>
          <div className={styles.addModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.addHeader}>
              <h2 className={styles.addHeaderTitle}>Add New Module</h2>
            </div>

            <div className={styles.addBody}>
              <label className={styles.addLabel}>Module Title</label>
              <input
                className={styles.addInput}
                placeholder="Enter module title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <label className={styles.addLabel}>Module Description</label>
              <textarea
                className={styles.addTextarea}
                placeholder="Enter module description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />

              <label className={styles.addLabel}>Subject / Course</label>
              <input
                className={styles.addInput}
                placeholder="e.g. IT 101 / Web Dev"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
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

              {/* ✅ NEW: Lesson Text Contents */}
              <label className={styles.addLabel}>Lesson Text Contents</label>
              <textarea
                className={styles.addTextarea}
                placeholder="Paste or type lesson text contents here..."
                value={lessonText}
                onChange={(e) => setLessonText(e.target.value)}
                rows={4}
              />

              {/* ✅ NEW: Quiz/Cards Contents */}
              <label className={styles.addLabel}>Quiz/Cards Contents</label>
              <textarea
                className={styles.addTextarea}
                placeholder="Paste or type quiz/cards contents here..."
                value={quizContents}
                onChange={(e) => setQuizContents(e.target.value)}
                rows={4}
              />

              <div className={styles.addDivider} />

              <div className={styles.addActions}>
                <button
                  className={styles.addCancelBtn}
                  onClick={closeAddModal}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className={styles.addConfirmBtn}
                  onClick={handleAddModule}
                  type="button"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ✅ VIEW MODULE MODAL (existing)
         ========================= */}
      {modalOpen && selectedModule && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <h2>Modules Details:</h2>
                <button className={styles.headerEditBtn} type="button">
                  Edit
                </button>
              </div>

              <button
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div>
                  <div className={styles.label}>Module Title</div>
                  <div className={styles.value}>Module Description</div>
                </div>

                <div>
                  <div className={styles.label}>Deck Title</div>
                  <div className={styles.value}>Deck Description</div>
                </div>
              </div>

              <h3 className={styles.cardsTitle}>Modules Decks</h3>

              <div className={styles.cardItem}>
                <div className={styles.question}>
                  What is the primary purpose of a "router" in a home network?
                </div>
                <div className={styles.answer}>
                  To forward data between different networks, such as your home network and the
                  internet.
                </div>
              </div>

              <div className={styles.cardItem}>
                <div className={styles.question}>
                  Which network device is used to amplify a Wi-Fi signal?
                </div>
                <div className={styles.answer}>A Wi-Fi Repeater/Extender</div>
              </div>

              <div className={styles.cardItem}>
                <div className={styles.question}>
                  What does the acronym "LAN" commonly stand for?
                </div>
                <div className={styles.answer}>Local Area Network</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}