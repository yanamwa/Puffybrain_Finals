import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import QuizModesModal from "../../components/QuizModesModal";
import styles from "./userDecks.module.css";

export default function UserDecks() {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [activeTab, setActiveTab] = useState("All Cards");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [deck, setDeck] = useState(null);
  const [myDecks, setMyDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [courses, setCourses] = useState([]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0;

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [imageName, setImageName] = useState("");
  const imageInputRef = useRef(null);

  const getCardImageSrc = (cardImage) => {
    if (!cardImage) return "";
    if (cardImage.startsWith("http://") || cardImage.startsWith("https://")) {
      return cardImage;
    }
    return `http://localhost/puffybrain/card_images/${cardImage}`;
  };

  const resetCardForm = () => {
    setQuestion("");
    setAnswer("");
    setEditingCardId(null);
    setImage(null);
    setPreview("");
    setImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setImageName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
    setImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const fetchDeck = async () => {
    try {
      const res = await fetch(
        `http://localhost/puffybrain/getDeckById.php?deckId=${deckId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      console.log("DECK RESPONSE:", data);

      if (data.success) {
        setDeck(data.deck);
      } else {
        console.error("Failed to fetch deck:", data.message);
      }
    } catch (err) {
      console.error("fetchDeck error:", err);
    }
  };

  const fetchCards = async () => {
    try {
      const res = await fetch(
        `http://localhost/puffybrain/getCardsByDeck.php?deckId=${deckId}`
      );

      const data = await res.json();
      console.log("Cards response:", data);

      if (data.success) {
        setCards(data.cards || []);
      } else {
        setCards([]);
      }
    } catch (err) {
      console.error("fetchCards error:", err);
      setCards([]);
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMyDecks(data.decks || []);
      }
    } catch (err) {
      console.error("fetchUserDecks error:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("fetchCourses error:", err);
      setCourses([]);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser({
          username: data.user?.username || "",
          year_level: data.user?.year_level || "",
          profile_image:
            data.user?.profile_image || "/images/temporary profile.jpg",
        });
      }
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    if (!deckId) {
      console.error("deckId is missing from route params");
      return;
    }

    fetchDeck();
    fetchCards();
    fetchUserDecks();
    fetchCourses();
    fetchUser();
  }, [deckId]);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}`
      );

      if (!insideDropdown) {
        setDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const isOwner =
    String(deck?.creator_username || "").toLowerCase() ===
    String(user?.username || "").toLowerCase();

  const openAddCard = () => {
    resetCardForm();
    setShowAddCard(true);
  };

  const closeAddCard = () => {
    setShowAddCard(false);
    resetCardForm();
  };

  const handleAddCard = async () => {
    if (!deckId) {
      Swal.fire("Missing deck", "Deck ID is missing.", "error");
      return;
    }

    if (!question.trim() || !answer.trim()) {
      Swal.fire("Missing fields", "Please fill in both question and answer.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("deckId", deckId);
    formData.append("question", question.trim());
    formData.append("answer", answer.trim());

    if (image) formData.append("image", image);
    if (editingCardId) formData.append("cardId", editingCardId);

    try {
      const url = editingCardId
        ? "http://localhost/puffybrain/updateCard.php"
        : "http://localhost/puffybrain/addCard.php";

      const res = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        const isEditing = editingCardId !== null;

        resetCardForm();
        setShowAddCard(false);
        await fetchCards();

        Swal.fire({
          title: isEditing ? "Edit Successfully!" : "Card Added!",
          text: isEditing
            ? "The card was edited successfully."
            : "The card was added successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Failed", data.message || "Could not save the card.", "error");
      }
    } catch (err) {
      console.error("handleAddCard error:", err);
      Swal.fire("Server Error", "Something went wrong while saving the card.", "error");
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
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("cardId", cardId);
      formData.append("deckId", deckId);

      const res = await fetch("http://localhost/puffybrain/deleteCard.php", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        await fetchCards();

        Swal.fire({
          title: "Deleted!",
          text: "The card was removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", data.message || "Failed to delete card.", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Server Error", "Something went wrong.", "error");
    }
  };

  const handleEditDeck = async () => {
    if (!deck) return;

    const { value: formValues } = await Swal.fire({
      title: "Edit Deck",
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Deck title" value="${deck.title || ""}">
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Deck description">${deck.description || ""}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        return {
          title: document.getElementById("swal-title").value,
          description: document.getElementById("swal-desc").value,
        };
      },
    });

    if (!formValues) return;

    try {
      const formData = new FormData();
      formData.append("deckId", deckId);
      formData.append("title", formValues.title);
      formData.append("description", formValues.description);

      const res = await fetch("http://localhost/puffybrain/updateDeck.php", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        await fetchDeck();

        Swal.fire({
          title: "Updated!",
          text: "Deck information updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", data.message || "Failed to update deck.", "error");
      }
    } catch (err) {
      console.error("handleEditDeck error:", err);
    }
  };

  const handleEditCard = (card) => {
    setQuestion(card.question || "");
    setAnswer(card.answer || "");
    setEditingCardId(card.cardId);
    setShowAddCard(true);

    if (card.image) {
      setPreview(getCardImageSrc(card.image));
    } else {
      setPreview("");
    }

    setImage(null);
    setImageName("");
  };

  const filteredCards = cards.filter((card) => {
    if (activeTab === "All Cards") return true;
    if (activeTab === "Memorized") return Number(card.is_memorized) === 1;
    if (activeTab === "Not Memorized") return Number(card.is_memorized) !== 1;
    return true;
  });

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#7b5cff",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img
              className={styles.logoExpanded}
              src="/images/logo1.png"
              alt="Logo"
            />
            <img
              className={styles.logoCollapsed}
              src="/images/logo_solo.png"
              alt="Logo"
            />
          </div>

          <div className={styles.divider}></div>
          <p className={styles.myDecksTitle}>Menu</p>

          <nav className={styles.menu}>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarListItem}>
                <NavLink
                  to="/homepage"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-home"></i>
                  <span className={styles.menuText}>Home</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                          <NavLink
                to="/mydecks"
                end
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <i className="bx bx-collection"></i>
                <span className={styles.menuText}>Decks</span>
              </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink
                  to="/mycourse"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-book-open"></i>
                  <span className={styles.menuText}>My Course</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink
                  to="/public-decks"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-world"></i>
                  <span className={styles.menuText}>Public Decks</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.myDecksNav}>
            <div className={styles.sectionBlock}>
              <p className={styles.sectionTitle}>My Decks</p>

              <ul className={styles.sectionList}>
                {myDecks.length === 0 ? (
                  <li className={styles.sidebarEmptyText}>Don't have decks yet</li>
                ) : (
                  myDecks.slice(0, 3).map((deckItem) => (
                    <li key={deckItem.id} className={styles.sidebarListItem}>
                      <Link to={`/deck/${deckItem.id}`} className={styles.menuItem}>
                        <i className="bx bx-collection"></i>
                        <span className={styles.menuText}>{deckItem.title}</span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className={styles.sectionBlock}>
              <div className={styles.sectionDivider}></div>
              <p className={styles.sectionTitle}>My Courses</p>

              <ul className={styles.sectionList}>
                {courses.length === 0 ? (
                  <li className={styles.sidebarEmptyText}>No courses added yet</li>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <li key={course.id} className={styles.sidebarListItem}>
                      <button
                        type="button"
                        onClick={() => openCourse(course.id)}
                        className={styles.menuItem}
                      >
                        <i className="bx bx-book-open"></i>
                        <span className={styles.menuText}>{course.title}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <div className={styles.headerContainer}>
            <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Search your decks" />
              <i className="bx bx-search" />
            </form>

            <div className={styles.profileWrapper}>
              <div className={styles.notificationWrapper}>
                <button
                  type="button"
                  className={styles.notificationBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationOpen((prev) => !prev);
                    setDropdownOpen(false);
                  }}
                >
                  <i className="bx bx-bell"></i>
                  {notificationCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {notificationCount}
                    </span>
                  )}
                </button>

                <div
                  className={`${styles.notificationDropdown} ${
                    notificationOpen ? styles.show : ""
                  }`}
                >
                  <h4>Notifications</h4>
                  <div className={styles.emptyNotification}>
                    <p>You don’t have any new notifications</p>
                  </div>
                </div>
              </div>

              <Link to="/user-profile" className={styles.profileLink}>
                <div className={styles.dpContainer}>
                  <img
                    src={user.profile_image || "/images/temporary profile.jpg"}
                    alt="Profile"
                    className={styles.profilePic}
                  />
                </div>

                <div className={styles.userInfo}>
                  <p>{user.username}</p>
                </div>
              </Link>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((v) => !v);
                    setNotificationOpen(false);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div
                  className={`${styles.dropdownContent} ${
                    dropdownOpen ? styles.show : ""
                  }`}
                >
                  <NavLink to="/user-profile">
                    <i className="bx bx-cog" />
                    <span>Settings</span>
                  </NavLink>

                  <NavLink to="/how-it-works">
                    <i className="bx bx-help-circle" />
                    <span>FAQs</span>
                  </NavLink>

                  <button type="button" onClick={handleLogout}>
                    <i className="bx bx-log-out" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className={styles.main}>
            <section className={styles["deck-info-container"]}>
              <div
                className={styles["deck-top"]}
                style={{
                  backgroundColor: deck?.deck_color || "#c9cdfa",
                }}
              ></div>

              <div className={styles["deck-info"]}>
                {deck ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <h3>{deck.title}</h3>

                      {isOwner && (
                        <button
                          onClick={handleEditDeck}
                          className={styles.deckEditBtn}
                        >
                          <i className="bx bx-edit"></i>
                          Edit
                        </button>
                      )}
                    </div>

                    <p>{cards.length} cards</p>

                    <hr />

                    <div className={styles.desc}>
                      <p>Description</p>
                      <p>{deck.description || "No description"}</p>
                      <hr />
                    </div>

                    {isOwner ? (
                      <div className={styles.creatorSimple}>
                        <span className={styles.creatorLabel}>Created by you</span>

                        <span className={styles["deck-privacy"]}>
                          <span className={styles.dot}></span>
                          {deck?.visibility || "private"}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.creatorBox}>
                        <div className={styles.creatorLeft}>
                          <span className={styles.creatorLabel}>Created by</span>

                          <div className={styles.creatorUser}>
                            <img
                              src={
                                deck?.creator_profile_image ||
                                "/images/temporary profile.jpg"
                              }
                              alt="Creator"
                              className={styles.creatorImg}
                            />

                            <span className={styles.creatorName}>
                              @{deck?.creator_username || "unknown"}
                            </span>
                          </div>
                        </div>

                                  <button
                      type="button"
                      className={styles.visitBtn}
                      onClick={() => {
                        const creatorId =
                          deck?.created_by ||
                          deck?.creator_id ||
                          deck?.user_id;

                        console.log("DECK:", deck);
                        console.log("CREATOR ID TO VISIT:", creatorId);

                        if (!creatorId) {
                          Swal.fire("Missing User", "Creator ID was not found.", "warning");
                          return;
                        }

                        navigate(`/user-profile/${creatorId}`);
                      }}
                    >
                      Visit Profile
                    </button>

                      </div>
                    )}
                  </>
                ) : (
                  <p>Loading deck...</p>
                )}
              </div>
            </section>

            <section
              className={styles["cards-panel"]}
              style={{
                "--deck-color": deck?.deck_color || "#c9cdfa",
              }}
            >
              <div className={styles["cards-actions"]}>
                {isOwner && (
                  <button className={styles["add-cards"]} onClick={openAddCard}>
                    Add Cards
                  </button>
                )}

                <button
                  className={styles.practice}
                  onClick={() => {
                    if (!cards || cards.length === 0) {
                      Swal.fire({
                        icon: "info",
                        title: "No Quiz Available",
                        text: "You need to add cards first before practicing.",
                        confirmButtonColor: "#7b5cff",
                      });
                      return;
                    }

                    setShowModes(true);
                  }}
                >
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

              {filteredCards.length === 0 ? (
                <div className={styles.emptyState}>
                  <img
                    src="/images/cute1.png"
                    className={styles["empty-img"]}
                    alt="Empty"
                  />
                  <p className={styles["empty-msg"]}>There are no cards</p>
                </div>
              ) : (
                <div className={styles.cardsList}>
                  {filteredCards.map((card) => (
                    <div key={card.cardId} className={styles.cards}>
                      {isOwner && (
                        <div className={styles.cardHeader}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEditCard(card)}
                          >
                            <i className="bx bx-edit"></i>
                            <span>Edit</span>
                          </button>

                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteCard(card.cardId)}
                          >
                            <i className="bx bx-trash"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}

                      <p>{card.question}</p>
                      <hr />
                      <p>{card.answer}</p>

                      {card.image && (
                        <img
                          src={getCardImageSrc(card.image)}
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
        <div
          className={styles["modal-overlay"]}
          onClick={closeAddCard}
          style={{ display: "flex" }}
        >
          <div
            className={styles["add-card-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["add-card-modalheader"]}>
              <span>{editingCardId ? "Edit Card" : "Add New Card"}</span>
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

            {preview && (
              <div className={styles["image-preview"]}>
                <img src={preview} alt="preview" />
                <button
                  type="button"
                  className={styles["remove-img"]}
                  onClick={removeImage}
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
            )}

            {!imageName && (
              <label className={styles["attach-img"]}>
                <i className="bx bx-image"></i> Attach image
                <input
                  type="file"
                  ref={imageInputRef}
                  className={styles.fileInput}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}

            {imageName && (
              <div className={styles.uploadedFile}>
                <i className="bx bx-check-circle"></i>
                <span>{imageName}</span>
              </div>
            )}

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

      {showModes && (
        <QuizModesModal
          source="deck"
          deckId={deckId}
          cards={cards}
          onClose={() => setShowModes(false)}
        />
      )}
    </div>
  );
}