import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import QuizModesModal from "../../components/QuizModesModal";
import styles from "./userDecks.module.css";
import Swal from "sweetalert2";

export default function UserDecks() {

  /* =========================
     NAVIGATION / PARAMS
  ========================= */

  const navigate = useNavigate();
  const { deckId } = useParams();

  /* =========================
     STATE
  ========================= */

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [activeTab, setActiveTab] = useState("All Cards");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [deck, setDeck] = useState(null);
  const [myDecks, setMyDecks] = useState([]);
  const [cards, setCards] = useState([]);

  const [user, setUser] = useState({
    username: "",
    year_level: ""
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);

  const [editingCardId, setEditingCardId] = useState(null);

  /* =========================
     REFS
  ========================= */

  const imageInputRef = useRef(null);
  const previewImgRef = useRef(null);

  /* =========================
     IMAGE HANDLERS
  ========================= */

  const handleImageAttach = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);

    if (previewImgRef.current) {
      previewImgRef.current.src = URL.createObjectURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);

    if (previewImgRef.current) previewImgRef.current.src = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  /* =========================
     FETCH FUNCTIONS (API)
  ========================= */

  const fetchDeck = async () => {
    try {

      const res = await fetch(
        `http://localhost/puffybrain/getDeckById.php?deckId=${deckId}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.success) {
        setDeck(data.deck);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const fetchCards = async () => {

    const res = await fetch(
      `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`
    );

    const data = await res.json();

    console.log("Cards:", data);

    if (data.success) {
      setCards(data.cards);
    }

  };

  const fetchUserDecks = async () => {

    try {

      const res = await fetch(
        "http://localhost/puffybrain/userDecks.php",
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.success) {
        setMyDecks(data.decks);
      }

    } catch (err) {
      console.error(err);
    }

  };

  const fetchUser = async () => {

    try {

      const res = await fetch(
        "http://localhost/puffybrain/getUser.php",
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      }

    } catch (err) {
      console.error(err);
    }

  };

  /* =========================
     USE EFFECTS
  ========================= */

  useEffect(() => {

    fetchDeck();
    fetchCards();

  }, [deckId]);

  useEffect(() => {

    fetchDeck();
    fetchCards();
    fetchUserDecks();
    fetchUser();

  }, [deckId]);

  useEffect(() => {

    const handler = (e) => {
      const insideDropdown = e.target.closest?.(`.${styles.dropdown}`);
      if (!insideDropdown) setDropdownOpen(false);
    };

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);

  }, []);

  /* =========================
     UI CONTROLS
  ========================= */

  const openAddCard = () => setShowAddCard(true);

  const closeAddCard = () => {
    setShowAddCard(false);
    setQuestion("");
    setAnswer("");
    setEditingCardId(null);
    removeImage();
  };

  const handleLogout = () => {

    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
    }

  };

  const openDeck = (id) => {
    navigate(`/deck/${id}`);
  };

  /* =========================
     CARD CRUD
  ========================= */

const handleAddCard = async () => {

  if (!question || !answer) {
    alert("Please fill the question and answer");
    return;
  }

  const formData = new FormData();
  formData.append("deckId", deckId);
  formData.append("question", question);
  formData.append("answer", answer);

  if (image) {
    formData.append("image", image);
  }

  if (editingCardId) {
    formData.append("cardId", editingCardId);
  }

  try {

    const url = editingCardId
      ? "http://localhost/puffybrain/updateCard.php"
      : "http://localhost/puffybrain/addCard.php";

    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {

      const isEditing = editingCardId !== null;

      setQuestion("");
      setAnswer("");
      removeImage();

      setEditingCardId(null);
      setShowAddCard(false);

      fetchCards();

      Swal.fire({
        title: isEditing ? "Edit Successfully!" : "Card Added!",
        text: isEditing
          ? "The card was edited successfully."
          : "The card was added successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

    }

  } catch (err) {
    console.error(err);
  }

};

const handleDeleteCard = async (cardId) => {

  const result = await Swal.fire({
    title: "Delete this card?",
    text: "This action cannot be undone.",
    imageUrl: "/images/error.png",
    imageWidth: 80,
    imageHeight: 80,
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#6c757d"
  });

  if (!result.isConfirmed) return;

  try {

    const formData = new FormData();
    formData.append("cardId", cardId);

    const res = await fetch("http://localhost/puffybrain/deleteCard.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {

      setCards((prev) => prev.filter(card => card.id !== cardId));

      Swal.fire({
        title: "Deleted!",
        text: "The card was removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

    } else {

      Swal.fire({
        title: "Error",
        text: "Failed to delete card",
        icon: "error"
      });

    }

  } catch (error) {

    console.error("Delete error:", error);

    Swal.fire({
      title: "Server Error",
      text: "Something went wrong.",
      icon: "error"
    });

  }

};
const handleEditDeck = async () => {

  const { value: formValues } = await Swal.fire({
    title: "Edit Deck",
    html: `
      <input id="swal-title" class="swal2-input" placeholder="Deck title" value="${deck.title}">
      <textarea id="swal-desc" class="swal2-textarea" placeholder="Deck description">${deck.description || ""}</textarea>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Save",
    cancelButtonText: "Cancel",
    preConfirm: () => {
      return {
        title: document.getElementById("swal-title").value,
        description: document.getElementById("swal-desc").value
      };
    }
  });

  if (!formValues) return;

  try {

    const formData = new FormData();
    formData.append("deckId", deckId);
    formData.append("title", formValues.title);
    formData.append("description", formValues.description);

    const res = await fetch("http://localhost/puffybrain/updateDeck.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {

      fetchDeck();

      Swal.fire({
        title: "Updated!",
        text: "Deck information updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

    } else {

      Swal.fire({
        title: "Error",
        text: "Failed to update deck.",
        icon: "error"
      });

    }

  } catch (err) {
    console.error(err);
  }

};

  const handleEditCard = (card) => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setEditingCardId(card.id);
    setShowAddCard(true);
  };

  return (

    <div className={`${styles.container} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>
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
                <NavLink to="/homepage" className={styles.menuItem}>
                  <i className="bx bx-home"></i>
                  <span className={styles.menuText}>Home</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink to="/mydecks" className={`${styles.menuItem} ${styles.active}`}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Decks</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink to="/public-decks" className={styles.menuItem}>
                  <i className="bx bx-folder"></i>
                  <span className={styles.menuText}>Public Decks</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.myDecksNav}>
            <p className={styles.myDecks}>My Decks</p>
            <ul className={styles.sidebarList}>
              {myDecks.length === 0 ? (
                <li className={styles.sidebarListItem}>
                  <span className={styles.menuText} style={{ opacity: 0.6 }}>
                    Don't have decks yet
                  </span>
                </li>
              ) : (
                myDecks.slice(0, 3).map((deck) => (
                  <li key={deck.id} className={styles.sidebarListItem}>
                    <button
                      type="button"
                      onClick={() => openDeck(deck.id)}
                      className={styles.menuItem}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                    >
                      <i className="bx bx-book"></i>
                      <span className={styles.menuText}>{deck.title}</span>
                    </button>
                  </li>
                ))
              )}
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
        <div className={styles.gridContainer}>
          <div className={styles.headerContainer}>
            <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Search your decks"
              />
              <i className="bx bx-search" />
            </form>

            <div className={styles.profileWrapper}>
              <div className={styles.dpContainer}>
                <img src="/images/temporary profile.jpg" alt="Profile" className={styles.profilePic} />
              </div>

              <div className={styles.userInfo}>
                <p>{user.username}</p>
              </div>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((v) => !v);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ""}`}>
                  <NavLink to="/user-profile">
                    <i className="bx bx-cog" />
                    <span>Settings</span>
                  </NavLink>

                  <NavLink to="/how-it-works">
                    <i className="bx bx-help-circle" />
                    <span>FAQs</span>
                  </NavLink>

                  <NavLink to="/login">
                    <i className="bx bx-log-out" />
                    <span>Logout</span>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          <main className={styles.main}>
            <section className={styles["deck-info-container"]}>
              <div className={styles["deck-top"]}></div>

              <div className={styles["deck-info"]}>
                {deck ? (
                  <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3>{deck.title}</h3>

                <button
                  onClick={handleEditDeck}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#7B61FF"
                  }}
                >
                  <i className="bx bx-edit"></i>
                </button>
              </div>
              <p>{cards.length} cards</p>    

                <hr />

                    <div className={styles.desc}>
                      <p>Description</p>
                      <p>{deck.description || "No description"}</p>
                      <hr />
                    </div>

                    <div className={styles["deck-meta"]}>
<span>
  Created by {deck.created_by === user.username ? "you" : deck.created_by}
</span>
                      <span className={styles["deck-privacy"]}>
                        <span className={styles.dot}></span> {deck.visibility}
                      </span>
                    </div>
                  </>
                ) : (
                  <p>Loading deck...</p>
                )}
              </div>
            </section>

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

            {cards.length === 0 ? (

              <div className={styles["empty-wrapper"]}>
                <img src="/images/cute1.png" className={styles["empty-img"]} alt="Empty" />
                <p className={styles["empty-msg"]}>There are no cards</p>
              </div>

            ) : (

<div className={styles.cardsList}>
  {cards.map((card) => (
    <div key={card.id} className={styles.cards}>

      <div className={styles.cardHeader}>
        <button
          className={styles.editBtn}
          onClick={() => handleEditCard(card)}
        >
          <i className="bx bx-edit"></i>
        </button>

        <button
          className={styles.deleteBtn}
          onClick={() => handleDeleteCard(card.id)}
        Delete
        >
          <i className="bx bx-trash"></i>
        </button>
        
      </div>

      <p>{card.question}</p>
      <hr />
      <p>{card.answer}</p>

      {card.image && (
        <img
          src={`http://localhost/puffybrain/${card.image}`}
          alt="card"
          className={styles.cardImage}
        />
      )}

    </div>
  ))}
</div>
            )}

          </section>

        </main>

      </div>
      </div>

        {showAddCard && (
        <div className={styles["modal-overlay"]} onClick={closeAddCard} style={{ display: 'flex' }}>
          <div
            className={styles["add-card-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["add-card-modalheader"]}>
              <span>Add New Card</span>
            </div>

            <div className={styles["form-group"]}>
              <label>Question</label>
                <input
                  type="text"
                  placeholder="Add a question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
         </div>

            <div className={styles["form-group"]}>
              <label>Answer</label>
                <input
                  type="text"
                  placeholder="Add an answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
            </div>

            <div className={styles["image-preview"]}>
              <img ref={previewImgRef} alt="" />
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
              <button onClick={handleAddCard}>
                {editingCardId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className={styles["modal-overlay"]} style={{ display: 'flex' }}>
          <div className={styles["success-box"]}>
            <img src="/images/3.png" alt="Success" />
            <p>Card Successfully Added</p>
          </div>
        </div>
      )}

      {showModes && (
        <QuizModesModal onClose={() => setShowModes(false)} />
      )}
    </div>
  );
}
