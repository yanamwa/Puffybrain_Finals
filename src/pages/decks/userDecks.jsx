import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./userDecks.module.css";

export default function UserDecks() {
  const navigate = useNavigate();

  /* =============================
     UI STATE
  ============================= */
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [activeTab, setActiveTab] = useState("All Cards");

  const [myDecks, setMyDecks] = useState([]);
  const [user, setUser] = useState({
    username: "",
    year_level: "",
  });

  /* =============================
     IMAGE HANDLING
  ============================= */
  const imageInputRef = useRef(null);
  const previewImgRef = useRef(null);

  const handleImageAttach = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (previewImgRef.current) {
        previewImgRef.current.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (previewImgRef.current) previewImgRef.current.src = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  /* =============================
     MODALS
  ============================= */
  const openAddCard = () => setShowAddCard(true);
  const closeAddCard = () => setShowAddCard(false);

  const handleAddCard = () => {
    closeAddCard();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  /* =============================
     AUTH / DATA
  ============================= */
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setMyDecks(data.decks);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserDecks();
    fetchUser();
  }, []);

  /* =============================
     JSX
  ============================= */
  return (
    <div className={`${styles.container} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>
      
      {/* ========== SIDEBAR ========== */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img src="/images/logo1.png" alt="Logo" />
          </div>

          <p className={styles.myDecksTitle}>Menu</p>

<nav className={styles.menu}>
  <ul className={styles.sidebarList}>

    <li className={styles.sidebarListItem}>
      <Link to="/homepage" className={styles.menuItem}>
        <i className="bx bx-home"></i>
        <span className={styles.menuText}>Home</span>
      </Link>
    </li>

    <li className={styles.sidebarListItem}>
      <Link
        to="/decks"
        className={`${styles.menuItem} ${styles.active}`}
      >
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

          <p className={styles.myDecks}>My Decks</p>
          <ul className={styles.sidebarList}>
            {myDecks.length === 0 ? (
              <li style={{ opacity: 0.6 }}>Don’t have decks yet</li>
            ) : (
              myDecks.map((deck) => (
                <li key={deck.id}>
                  <Link to={`/deck/${deck.id}`} className={styles.menuItem}>
                    <i className="bx bx-book"></i> {deck.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <button className={styles.logoutLink} onClick={handleLogout}>
          <i className="bx bx-log-out"></i> Logout
        </button>
      </aside>

      {/* ========== MAIN WRAPPER (FIX) ========== */}
      <div className={styles.mainArea}>
        <main className={styles.main}>
          
          {/* Deck Info */}
          <section className={styles["deck-info-container"]}>
            <div className={styles["deck-top"]}></div>

            <div className={styles["deck-info"]}>
              <h3>Business Analysis Lesson 1</h3>
              <p>0 cards</p>
              <hr />

              <div className={styles.desc}>
                <p>Description</p>
                <p>Reviewer for lesson 1 midterm quiz</p>
                <hr />
              </div>

              <div className={styles["deck-meta"]}>
                <span>Created by you</span>
                <span className={styles["deck-privacy"]}>
                  <span className={styles.dot}></span> private
                </span>
              </div>
            </div>
          </section>

          {/* Cards Panel */}
          <section className={styles["cards-panel"]}>
            <div className={styles["cards-actions"]}>
              <button className={styles["add-cards"]} onClick={openAddCard}>
                Add Cards
              </button>
              <button className={styles.practice} onClick={() => setShowModes(true)}>
                Practice
              </button>
            </div>

            <div className={styles["cards-tabs"]}>
              {["All Cards", "Memorized", "Not Memorized"].map((tab) => (
                <span
                  key={tab}
                  className={activeTab === tab ? styles["active-tab"] : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className={styles["empty-wrapper"]}>
              <img src="/images/cute1.png" className={styles["empty-img"]} />
              <p className={styles["empty-msg"]}>There are no cards</p>
            </div>
          </section>

        </main>
      </div>

      {/* ================= ADD CARD MODAL ================= */}
      {showAddCard && (
        <div className={styles["modal-overlay"]} onClick={closeAddCard}>
          <div
            className={styles["add-card-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["add-card-modalheader"]}>
              <span>Add New Card</span>
            </div>

            <div className={styles["form-group"]}>
              <label>Question</label>
              <input />
            </div>

            <div className={styles["form-group"]}>
              <label>Answer</label>
              <input />
            </div>

            <div className={styles["image-preview"]}>
              <img ref={previewImgRef} />
              <button className={styles["remove-img"]} onClick={removeImage}>
                <i className="bx bx-x"></i>
              </button>
            </div>

            <button className={styles["attach-img"]} onClick={handleImageAttach}>
              <i className="bx bx-image"></i> Attach image
            </button>

            <input
              type="file"
              hidden
              ref={imageInputRef}
              onChange={handleImageChange}
            />

            <hr />

            <div className={styles["modal-actions"]}>
              <button onClick={closeAddCard}>Cancel</button>
              <button onClick={handleAddCard}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS ================= */}
      {showSuccess && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["success-box"]}>
            <img src="/images/3.png" />
            <p>Card Successfully Added</p>
          </div>
        </div>
      )}

      {/* ================= MODES ================= */}
      {showModes && (
        <div className={styles["modal-overlay"]} onClick={() => setShowModes(false)}>
          <div className={styles["modal-box"]} onClick={(e) => e.stopPropagation()}>
            <h2>Choose Quiz Type</h2>
            <button onClick={() => setShowModes(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}