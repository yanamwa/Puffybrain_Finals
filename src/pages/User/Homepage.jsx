import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Homepage.module.css";
import Calendar from "./Calendar";
import TodoList from "./TodoList";

function Homepage() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      navigate("/login");
    }
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
                <Link to="/Mydecks" className={styles.menuItem}>
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
        <header className={styles.header}>
          <form className={styles.searchBar}>
            <input type="text" placeholder="Search your deck title" />
            <i className="bx bx-search"></i>
          </form>
              <button className={styles.notificationBtn}>
                <i className="bx bx-bell"></i>
              </button>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.centerBox}>
            <h1>Hello, @meiko!</h1>
            <p>What are we going to study?</p>
            <img className={styles.sideImage} src="/images/2.png" alt="Big" />
          </div>

          <div className={styles.progress}>
            <h3>Continue Progress</h3>
            <div className={styles.decksArea}>
              <div className={styles.decksGrid}>
                <Link className={styles.deckLink}>
                  <article className={styles.deckCard}>
                    <div className={`${styles.cardTop} ${styles.cardTopColor1}`}></div>
                    <div className={styles.cardBody}>
                      <p className={styles.deckTitle}>Lesson 1 to 3 Networking</p>
                      <span className={styles.deckCount}>3 cards</span>
                    </div>
                  </article>    
                </Link>
         <Link className={styles.deckLink}>
                  <article className={styles.deckCard}>
                    <div className={`${styles.cardTop} ${styles.cardTopColor1}`}></div>
                    <div className={styles.cardBody}>
                      <p className={styles.deckTitle}>Lesson 1 to 3 Networking</p>
                      <span className={styles.deckCount}>3 cards</span>
                    </div>
                  </article>    
                </Link>
            <Link className={styles.deckLink}>
                  <article className={styles.deckCard}>
                    <div className={`${styles.cardTop} ${styles.cardTopColor1}`}></div>
                    <div className={styles.cardBody}>
                      <p className={styles.deckTitle}>Lesson 1 to 3 Networking</p>
                      <span className={styles.deckCount}>3 cards</span>
                    </div>
                  </article>    
                </Link>

              </div>
            </div>
          </div>

          <div className={styles.deckProgress}>
            <div className={styles.sectionHeader}>
              <h3>Deck Progress</h3>
              <div className={styles.sectionButtons}>
                <button className={styles.btnAdd} onClick={() => setShowPopup(true)}>
                  Add Deck
                </button>
                <button className={styles.btnShow} onClick={() => window.location.href = '../User_Navigations/Mydecks.html'}>
                  Show All
                </button>
              </div>
            </div>

            <div className={styles.decksArea}>
              <div className={styles.decksGrid}>
                <Link className={styles.deckLink}>
                  <article className={styles.deckCard}>
                    <div className={`${styles.cardTop} ${styles.cardTopColor1}`}></div>
                    <div className={styles.cardBody}>
                      <p className={styles.deckTitle}>Lesson 1 to 3 Networking</p>
                      <span className={styles.deckCount}>3 cards</span>
                    </div>
                  </article>
                </Link>

                <Link className={styles.deckLink}>
                  <article className={styles.deckCard}>
                    <div className={`${styles.cardTop} ${styles.cardTopColor2}`}></div>
                    <div className={styles.cardBody}>
                      <p className={styles.deckTitle}>Methods of Research Lesson 2</p>
                      <span className={styles.deckCount}>30 cards</span>
                    </div>
                  </article>
                </Link>

                <Link className={styles.deckLink}>
                  <article className={styles.deckCard}>
                    <div className={`${styles.cardTop} ${styles.cardTopColor3}`}></div>
                    <div className={styles.cardBody}>
                      <p className={styles.deckTitle}>Methods of Research Lesson 3</p>
                      <span className={styles.deckCount}>15 cards</span>
                    </div>
                  </article>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {showPopup && (
          <div className={styles.popupOverlay} onClick={() => setShowPopup(false)}>
            <div className={styles.popupContainer} onClick={(e) => e.stopPropagation()}>
              <form className={styles.subtitleForm}>
                <div className={styles.popupHeaderBar}>
                  <h2 className={styles.popupHeaderTitle}>Create New Deck</h2>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Deck Title</label>
                  <input type="text" className={styles.newdecktitle} placeholder="Enter your deck name" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Description</label>
                  <input type="text" className={styles.newdecktitle} placeholder="Optional description" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Visibility</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.pubpriv}>
                      <input type="radio" name="visibility" value="public" />
                      Public
                    </label>
                    <label className={styles.pubpriv}>
                      <input type="radio" name="visibility" value="private" />
                      Private
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Deck Color</label>
                  <div className={styles.colorOptions}>
                    <input type="radio" name="deckcolor" value="#C8BBD0" />
                    <input type="radio" name="deckcolor" value="#E0BBD4" />
                    <input type="radio" name="deckcolor" value="#C3C7F3" />
                    <input type="radio" name="deckcolor" value="#90F897" />
                    <input type="radio" name="deckcolor" value="#CF8686" />
                    <input type="radio" name="deckcolor" value="#EECB99" />
                  </div>
                </div>

                <div className={styles.popupDivider}></div>

                <div className={styles.startsaveContainer}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowPopup(false)}>
                    Cancel
                  </button>
                  <button type="button" className={styles.popaddBtn}>
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <aside className={styles.rightSidebar}>
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}></div>
          <h3 className={styles.profileName}>@meiko</h3>
          <p className={styles.profileRole}>2nd year</p>
          <Link to="/setting-profile/user_profile" className={styles.profileBtn}>
            Profile
          </Link>
        </div>

        <Calendar />
        <TodoList />

        <Link to="/setting-profile/setting-profilee" className={styles.settingsFooter}>
          ⚙ Settings
        </Link>
      </aside>
    </div>
  );
}

export default Homepage;
