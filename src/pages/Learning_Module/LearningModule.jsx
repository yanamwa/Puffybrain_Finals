import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Learning_Module.module.css";

function LearningModule() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
  setIsCollapsed(!isCollapsed);
};

const [isDropdownOpen, setIsDropdownOpen] = useState(false);

const toggleDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
};

const [sortOpen, setSortOpen] = useState(false);
const [levelOpen, setLevelOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  return (
 <div className={`${styles.container} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>

      {/* LEFT SIDEBAR */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>

        <div>
          <div className={styles.sidebarToggle} onClick={() => setIsCollapsed(!isCollapsed)}>
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

    
      <div className={styles.mainArea}>
                {/* Header */}
                      <header className={styles.moduleHeader}>

              <form className={styles.searchBar}>
                <input type="text" placeholder="Search your deck title" />
                <i className="bx bx-search"></i>
              </form>

              <div className={styles.headerRight}>

                <button className={styles.notificationBtn}>
                  <i className="bx bx-bell"></i>
                </button>

                <div className={styles.profileWrapper}>

                  <div className={styles.dpContainer}>
                    <img 
                      src="/images/temporary profile.jpg" 
                      alt="Profile Picture" 
                      className={styles.profilePic} 
                    />
                  </div>

                  <div className={styles.userInfo}>
                    <p style={{ fontSize: "20px", fontWeight: "normal" }}>
                      @meiko
                    </p>
                  </div>

                  <div className={styles.dropdown}>
                    <button 
                      type="button" 
                      className={styles.dropdownBtn} 
                      onClick={toggleDropdown}
                    >
                      <i className="bx bx-chevron-down"></i>
                    </button>

                    {isDropdownOpen && (
                      <div className={styles.dropdownContent}>

                        <Link to="/profile">
                          <i className="bx bx-user"></i>
                          <span>Profile</span>
                        </Link>

                        <Link to="/settings">
                          <i className="bx bx-cog"></i>
                          <span>Settings</span>
                        </Link>

                        <Link to="/faq">
                          <i className="bx bx-help-circle"></i>
                          <span>FAQs</span>
                        </Link>

                        <button onClick={handleLogout}>
                          <i className="bx bx-log-out"></i>
                          <span>Logout</span>
                        </button>

                      </div>
                    )}
                  </div>

                </div>
              </div>
            </header>

        <main className={styles.mainContent}>

            <div className={styles.courses}>

            <div className={styles.courseHead}></div>

            <div className={styles.innercourse}>
              <div className={styles.innerhead}>
              <h1>Lesson Name</h1>
              <div className={styles.cardCount}>
                {Math.floor(Math.random() * 10) + 1} Cards
              </div>
            </div>



            </div>
            

         </div>
          


        </main>

      </div>

    </div>
  );
}


export default LearningModule;