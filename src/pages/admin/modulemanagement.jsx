import React, { useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  Search,
  User,
  ChevronDown,
  Settings
} from "lucide-react";

import styles from "./modulemanage.module.css";

export default function ModuleManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Users size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <BookOpen size={20} /> },
  ];

  const modules = [
    { id: "QZ2025A01", title: "rairai", date: "10/11/2025", status: "active" },
    { id: "BK06A2025", title: "Paps", date: "11/27/2025", status: "active" },
    { id: "BK07A2025", title: "Larah", date: "12/17/2025", status: "active" },
    { id: "BK08A2025", title: "meiko", date: "11/22/2025", status: "active" },
    { id: "BK09A2025", title: "jessy", date: "11/16/2025", status: "inactive" },

    
  ];

  return (
    <div className={styles.layout}>
      
       {/* SIDEBAR */}
           <aside className={styles.sidebar}>
             <div className={styles.logo}>
               <img src="/images/logo1.png" alt="Logo" />
             </div>
     
             <div className={styles.menuLabel}>Menu</div>
     
             {menuItems.map(item => (
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
               <button className={styles.logoutBtn}>
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
          <User size={22} />
          <span className={styles.profileName}>@admin</span>

          <button
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen(prev => !prev)}
          >
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownContent}>
              <button className={styles.dropdownItem}>
                <Settings size={16} /> Settings
              </button>
              <button className={styles.dropdownItem}>
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
          <button className={styles.addBtn}>+ Add new module</button>
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
              {modules.map((mod) => (
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
                    <button className={styles.edit}>edit</button>
                    <button className={styles.delete}>delete</button>
                    <button
                      className={styles.view}
                      onClick={() => {
                        setSelectedModule(mod);
                        setModalOpen(true);
                      }}
                    >
                      view
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
  <div className={styles.modal} onClick={() => setModalOpen(false)}>
    <div
      className={styles.modalContent}
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className={styles.modalHeader}>
        <div className={styles.headerLeft}>
          <h2>Module Details:</h2>
          <button className={styles.editTopBtn}>Edit</button>
        </div>

        <button
          className={styles.closeBtn}
          onClick={() => setModalOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className={styles.modalBody}>
        <div className={styles.detailsGrid}>
          <div className={styles.label}>Module Title</div>
          <div className={styles.value}>{selectedModule.title}</div>

          <div className={styles.label}>Module Description</div>
          <div className={styles.value}>Deck Description</div>
        </div>

        <h3 className={styles.sectionTitle}>Module decks</h3>

        <div className={styles.card}>
          <p className={styles.question}>
            What is the primary purpose of a "router" in a home network?
          </p>
          <div className={styles.answer}>
            To forward data between different networks, such as your home
            network and the internet.
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.question}>
            Which network device is used to amplify a Wi-Fi signal?
          </p>
          <div className={styles.answer}>
            A Wi-Fi Repeater/Extender
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}