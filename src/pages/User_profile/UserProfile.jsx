import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./UserProfile.module.css";

function UserProfile() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className={`${styles.container} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>

      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img src="/images/logo1.png" alt="logo" />
          </div>

          <p className={styles.menuTitle}>Menu</p>

          <nav>
            <ul className={styles.sidebarList}>
              <li>
                <Link to="/" className={styles.menuItem}>
                  <i className="bx bx-home"></i> Home
                </Link>
              </li>

              <li>
                <Link to="/decks" className={styles.menuItem}>
                  <i className="bx bx-book"></i> Decks
                </Link>
              </li>

              <li>
                <Link to="/public-decks" className={styles.menuItem}>
                  <i className="bx bx-folder"></i> Public Decks
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <button className={styles.logout}>Logout</button>
      </aside>

      {/* MAIN AREA */}
      <div className={styles.mainArea}>

        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <input placeholder="Search your deck title" />
            <i className="bx bx-search"></i>
          </div>

          <i className="bx bx-bell"></i>
        </header>

        {/* CONTENT */}
        <div className={styles.content}>

          <h2 className={styles.pageTitle}>Edit Profile</h2>

          <div className={styles.editWrapper}>

            {/* FLOATING TABS */}
            <div className={styles.tabs}>
              <button
                className={activeTab === "personal" ? styles.activeTab : ""}
                onClick={() => setActiveTab("personal")}
              >
                Personal Information
              </button>

              <button
                className={activeTab === "settings" ? styles.activeTab : ""}
                onClick={() => setActiveTab("settings")}
              >
                Settings
              </button>
            </div>

            <div className={styles.editCard}>

              {activeTab === "personal" && (
                <div className={styles.editContent}>

                  <div className={styles.formLeft}>
                    <label>Username</label>
                    <input placeholder="enter your new username" />

                    <label>Email Address</label>
                    <input />

                    <label>Name of School</label>
                    <input />

                    <label>Year Level</label>
                    <input />

                    <button className={styles.saveBtn}>Save</button>
                  </div>

                  <div className={styles.photoUpload}>
                    <div className={styles.photoCircle}>
                      Upload Photo
                    </div>

                    <p className={styles.photoHint}>
                      Recommended ratio 1:1 and file size less than 5mb
                    </p>
                  </div>

                </div>
              )}

              {activeTab === "settings" && (
                <div className={styles.settingsForm}>

                  <label>New Password</label>
                  <input type="password" />

                  <label>Confirm Password</label>
                  <input type="password" />

                  <button className={styles.saveBtn}>
                    Update Password
                  </button>

                </div>
              )}

              <button
                className={styles.backBtn}
                onClick={() => setEditMode(false)}
              >
                Back
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default UserProfile;