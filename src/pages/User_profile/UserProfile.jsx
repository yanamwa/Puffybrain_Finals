import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./UserProfile.module.css";

function UserProfile() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <div className={`${styles.container} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>

        <div>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img className={styles.logoExpanded} src="/images/logo1.png" alt="Logo" />
            <img className={styles.logoCollapsed} src="/images/logo_solo.png" alt="Logo" />
          </div>

          <div className={styles.divider}></div>

          <p className={styles.myDecksTitle}>Menu</p>

          <nav className={styles.menu}>
            <ul className={styles.sidebarList}>

              <li className={styles.sidebarListItem}>
                <Link to="/" className={`${styles.menuItem} ${styles.active}`}>
                  <i className="bx bx-home"></i>
                  <span className={styles.menuText}>Home</span>
                </Link>
              </li>

              <li className={styles.sidebarListItem}>
                <Link to="/decks" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Decks</span>
                </Link>
              </li>

              <li className={styles.sidebarListItem}>
                <Link to="/public-decks" className={styles.menuItem}>
                  <i className="bx bx-folder"></i>
                  <span className={styles.menuText}>Public Decks</span>
                </Link>
              </li>

            </ul>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.myDecksNav}>
            <p className={styles.myDecks}>My Decks</p>
            <ul className={styles.sidebarList}>

              <li className={styles.sidebarListItem}>
                <Link to="/deck/1" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Lesson 1 to 3 Networking</span>
                </Link>
              </li>

              <li className={styles.sidebarListItem}>
                <Link to="/deck/2" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Method of Research Lesson 2</span>
                </Link>
              </li>

              <li className={styles.sidebarListItem}>
                <Link to="/deck/3" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Method of Research Lesson 3</span>
                </Link>
              </li>

            </ul>
          </div>
        </div>

        <div className={styles.logout}>
          <button className={styles.logoutLink} onClick={handleLogout}>
            <i className="bx bx-log-out"></i>
            <span className={styles.menuText}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT SIDE ================= */}
      <div className={styles.mainArea}>

        {/* HEADER */}
        <header className={styles.header}>
          <form className={styles.searchBar}>
            <input type="text" placeholder="Search your deck title" />
            <i className="bx bx-search"></i>
          </form>

          <button className={styles.notificationBtn}>
            <i className="bx bx-bell"></i>
          </button>
        </header>

        {/* ================= CONTENT ================= */}
        <div
          className={styles.content}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "60px",
            padding: "40px 0"
          }}
        >

          {/* ===== STUDENT ID CARD ===== */}
          <div
            style={{
              position: "relative",
              width: "700px",
              background: "#f5f5f5",
              borderRadius: "20px",
              padding: "40px 40px 40px 120px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.15)"
            }}
          >
            <h1 style={{ textAlign: "center" }}>Student ID Card</h1>
            <hr style={{ margin: "15px 0 30px 0", borderStyle: "dashed" }} />

            <p><b>Username:</b> meiko</p>
            <p><b>Year:</b> 2nd Year</p>
            <p><b>School:</b> Cavite State University Imus Campus</p>
            <p><b>Signature:</b> meiko</p>

            <button
              className={styles.editBtn}
              style={{
                position: "absolute",
                right: "30px",
                bottom: "30px"
              }}
            >
              Edit Profile
            </button>

            {/* PROFILE IMAGE OVERLAY */}
            <div
              style={{
                position: "absolute",
                left: "-60px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "120px",
                height: "150px",
                background: "#ffffff",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              Photo
            </div>
          </div>

          {/* ===== PUBLIC DECKS ===== */}
          <div
            style={{
              width: "900px",
              background: "#f5f5f5",
              borderRadius: "30px",
              padding: "40px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.15)"
            }}
          >
            <h2 style={{ marginBottom: "30px" }}>Public Decks</h2>

            <div
              style={{
                display: "flex",
                gap: "40px"
              }}
            >
              {/* Deck 1 */}
              <div
                style={{
                  width: "200px",
                  background: "#d8b4e2",
                  borderRadius: "15px",
                  padding: "20px"
                }}
              >
                <div
                  style={{
                    height: "100px",
                    background: "#c084c2",
                    borderRadius: "10px",
                    marginBottom: "15px"
                  }}
                />
                <strong>Network Fundamentals</strong>
                <p style={{ fontSize: "12px" }}>23 cards</p>
              </div>

              {/* Deck 2 */}
              <div
                style={{
                  width: "200px",
                  background: "#d8b4e2",
                  borderRadius: "15px",
                  padding: "20px"
                }}
              >
                <div
                  style={{
                    height: "100px",
                    background: "#c084c2",
                    borderRadius: "10px",
                    marginBottom: "15px"
                  }}
                />
                <strong>Subject Subject Subject</strong>
                <p style={{ fontSize: "12px" }}>23 cards</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserProfile;