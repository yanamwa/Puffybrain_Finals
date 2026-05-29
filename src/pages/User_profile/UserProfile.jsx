import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";
import styles from "./UserProfile.module.css";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";

function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [archivedDecks, setArchivedDecks] = useState([]);
  const [sidebarDecks, setSidebarDecks] = useState([]);
  const [profileDecks, setProfileDecks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeDeckTab, setActiveDeckTab] = useState("decks");
  const [archivedDropdownOpen, setArchivedDropdownOpen] = useState(null);

  const [user, setUser] = useState({
    id: "",
    username: "",
    year_level: "",
    school: "",
    signature: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [loggedInUser, setLoggedInUser] = useState({
    id: "",
    username: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const getUserId = (obj) => {
    return obj?.id || obj?.user_id || obj?.UserID || obj?.userid || "";
  };

  const getDeckId = (deck) => {
    return deck?.deck_id || deck?.id || deck?.DeckID || "";
  };

  const getDeckCategory = (deck) => {
    return (
      deck?.category ||
      deck?.deck_category ||
      deck?.subject ||
      deck?.deckCategory ||
      "Reviewer"
    );
  };

  const getDeckColor = (deck) => {
    const rawColor =
      deck?.deck_color ||
      deck?.deckColor ||
      deck?.color ||
      deck?.deck_colour ||
      "";

    const color = String(rawColor).trim();

    return color && color.toLowerCase() !== "#ffffff" ? color : "#D7C9F7";
  };

  const getDeckCardCount = (deck) => {
    return Number(deck?.card_count ?? deck?.cards ?? deck?.cardCount ?? 0);
  };

  const filterDecks = (decks) => {
    const q = search.trim().toLowerCase();
    if (!q) return decks;

    return decks.filter((deck) => {
      const searchableText = [
        deck.title,
        deck.description,
        getDeckCategory(deck),
        deck.visibility,
        getDeckCardCount(deck),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(q);
    });
  };

  const filteredDecks = filterDecks(profileDecks);
  const filteredArchivedDecks = filterDecks(archivedDecks);

  const fetchSidebarDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/userDecks.php`, {
        credentials: "include",
      });

      const data = await res.json();
      setSidebarDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("fetchSidebarDecks error:", err);
      setSidebarDecks([]);
    }
  };

  const fetchUserDecks = async (profileId, ownProfile = false) => {
    if (!profileId) {
      setProfileDecks([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/getUserDecksById.php?user_id=${profileId}`,
        { credentials: "include" }
      );

      const text = await res.text();
      console.log("USER DECKS RAW:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        setProfileDecks([]);
        return;
      }

      const decks = data.success ? data.decks || [] : [];

      const visibleDecks = ownProfile
        ? decks
        : decks.filter(
            (deck) => String(deck.visibility || "").toLowerCase() === "public"
          );

      setProfileDecks(visibleDecks);
    } catch (err) {
      console.error("Failed to fetch user decks:", err);
      setProfileDecks([]);
    }
  };

  const fetchArchivedDecks = async (profileId) => {
    if (!profileId) {
      setArchivedDecks([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/getArchivedDecks.php?user_id=${profileId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      setArchivedDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("Failed to fetch archived decks:", err);
      setArchivedDecks([]);
    }
  };

  const fetchAddedCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/getMyCourses.php`, {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setCourses([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/getUserNotifications.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setNotifications(data.success ? data.notifications || [] : []);
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotifications([]);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/markNotificationsAsRead.php`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            status: "read",
          }))
        );
      }
    } catch (err) {
      console.error("Mark notifications as read error:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const currentRes = await fetch(`${API_BASE}/getUser.php`, {
        credentials: "include",
      });

      const currentText = await currentRes.text();
      console.log("CURRENT USER RAW:", currentText);

      let currentData;

      try {
        currentData = JSON.parse(currentText);
      } catch {
        navigate("/login");
        return;
      }

      if (!currentData.success) {
        navigate("/login");
        return;
      }

      const loggedUser = currentData.user || currentData;
      const loggedUserId = getUserId(loggedUser);

      if (!loggedUserId) {
        console.error("Logged user id not found:", currentData);
        return;
      }

      setLoggedInUser({
        id: loggedUserId,
        username: loggedUser.username || "",
        profile_image:
          loggedUser.profile_image || "/images/temporary profile.jpg",
      });

      const profileId = userId || loggedUserId;

      const profileRes = await fetch(
        `${API_BASE}/getUserProfile.php?id=${profileId}`,
        { credentials: "include" }
      );

      const profileText = await profileRes.text();
      console.log("PROFILE RAW:", profileText);

      let profileData;

      try {
        profileData = JSON.parse(profileText);
      } catch {
        return;
      }

      if (!profileData.success) {
        console.error(profileData.message || "Profile not found");
        return;
      }

      const profileUser = profileData.user || profileData;
      const profileUserId = getUserId(profileUser) || profileId;
      const ownProfile = String(loggedUserId) === String(profileUserId);

      setUser({
        id: profileUserId,
        username: profileUser.username || "",
        year_level: profileUser.year_level || "",
        school: profileUser.school || "",
        signature: profileUser.signature || profileUser.username || "",
        profile_image:
          profileUser.profile_image || "/images/temporary profile.jpg",
      });

      setIsOwnProfile(ownProfile);

      await fetchSidebarDecks();
      await fetchUserDecks(profileUserId, ownProfile);

      if (ownProfile) {
        await fetchArchivedDecks(profileUserId);
      } else {
        setArchivedDecks([]);
        setActiveDeckTab("decks");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleRestore = async (deckId) => {
    try {
      const res = await fetch(`${API_BASE}/restoreDeck.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deck_id: deckId }),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Restored!", "Deck has been restored.", "success");
        fetchArchivedDecks(user.id);
        fetchSidebarDecks();
        fetchUserDecks(user.id, true);
      } else {
        Swal.fire("Error", data.message || "Failed to restore", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error", "error");
    }
  };

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8d6cab",
      cancelButtonColor: "#b0b0b0",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: styles.logoutPopup,
        title: styles.logoutTitle,
        htmlContainer: styles.logoutText,
        confirmButton: styles.logoutConfirm,
        cancelButton: styles.logoutCancel,
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await fetch(`${API_BASE}/logout.php`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout API error:", err);
      }

      localStorage.removeItem("username");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_id");
      localStorage.removeItem("profile_image");

      sessionStorage.clear();

      navigate("/login", { replace: true });
    });
  };

  const handleShare = async () => {
    const profileLink = `${window.location.origin}/user-profile/${user.id}`;

    try {
      await navigator.clipboard.writeText(profileLink);

      toast.success("Profile link copied!", {
        className: styles.toastSuccess,
        progressClassName: styles.toastSuccessProgress,
        icon: <i className="bx bx-check-circle"></i>,
      });
    } catch (error) {
      console.error("Failed to copy profile link:", error);

      toast.error("Unable to copy the profile link.", {
        className: styles.toastError,
        progressClassName: styles.toastErrorProgress,
        icon: <i className="bx bx-error-circle"></i>,
      });
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAddedCourses();
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `[data-user-header], [data-user-header-menu], [data-user-header-toggle], .${styles.deckMenuWrapper}, .${styles.searchBar}`
      );

      if (!insideDropdown) {
        setDropdownOpen(false);
        setArchivedDropdownOpen(null);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      <UserSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        myDecks={sidebarDecks}
        courses={courses}
        openCourse={openCourse}
        getDeckId={getDeckId}
      />

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <UserHeader
            isCollapsed={isCollapsed}
            searchQuery={search}
            setSearchQuery={setSearch}
            handleSearchSubmit={(e) => e.preventDefault()}
            notificationOpen={notificationOpen}
            setNotificationOpen={setNotificationOpen}
            setDropdownOpen={setDropdownOpen}
            notificationCount={notificationCount}
            notifications={notifications}
            markNotificationsAsRead={markNotificationsAsRead}
            user={loggedInUser}
            profileDropdownOpen={dropdownOpen}
            setProfileDropdownOpen={setDropdownOpen}
            handleLogout={handleLogout}
          />

          <main className={styles.main}>
            <div className={styles.profileCard}>
              <div className={styles.idPhotoBox}>
                <div className={styles.idPhotoFrame}>
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className={styles.idPhoto}
                  />
                </div>
                <div className={styles.idBarcode}></div>
              </div>

              <div className={styles.profileCardInner}>
                <div className={styles.profileCardTop}>
                  <h1 className={styles.profileTitle}>Student ID Card</h1>

                  <button
                    className={styles.shareBtn}
                    type="button"
                    onClick={handleShare}
                    title="Copy profile link"
                  >
                    <i className="bx bx-share-alt"></i>
                  </button>
                </div>

                <div className={styles.profileDivider}></div>

                <div className={styles.profileInfoGrid}>
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Username:</span>
                    <span className={styles.profileValue}>
                      {user.username || "User"}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Year:</span>
                    <span className={styles.profileValue}>
                      {user.year_level || "Not set"}
                    </span>
                  </div>

                  <div
                    className={`${styles.profileField} ${styles.profileFieldWide}`}
                  >
                    <span className={styles.profileLabel}>School:</span>
                    <span className={styles.profileValue}>
                      {user.school || "Not set"}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Signature:</span>
                    <span className={styles.signatureText}>
                      {user.signature || user.username || "User"}
                    </span>
                  </div>

                  <div className={styles.profileButtonWrap}>
                    {isOwnProfile ? (
                      <button
                        className={styles.editBtn}
                        onClick={() => navigate("/edit-profile")}
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button className={styles.editBtn} type="button" disabled>
                        Visiting Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.deckTabsSection}>
              <div className={styles.deckTabsHeader}>
                <button
                  type="button"
                  className={
                    activeDeckTab === "decks" ? styles.activeTab : styles.tabBtn
                  }
                  onClick={() => setActiveDeckTab("decks")}
                >
                  {isOwnProfile
                    ? "My Decks"
                    : `${user.username || "User"}'s Decks`}
                </button>

                {isOwnProfile && (
                  <>
                    <span className={styles.tabDivider}></span>

                    <button
                      type="button"
                      className={
                        activeDeckTab === "archive"
                          ? styles.activeTab
                          : styles.tabBtn
                      }
                      onClick={() => setActiveDeckTab("archive")}
                    >
                      Archive
                    </button>
                  </>
                )}
              </div>

              {activeDeckTab === "decks" && (
                <div className={styles.decksGrid}>
                  {profileDecks.length === 0 ? (
                    <p className={styles.emptyText}>
                      {isOwnProfile
                        ? "No decks available"
                        : "No public decks available"}
                    </p>
                  ) : filteredDecks.length === 0 ? (
                    <p className={styles.emptyText}>
                      No decks found for “{search}”.
                    </p>
                  ) : (
                    filteredDecks.map((deck) => {
                      const deckId = getDeckId(deck);
                      const deckColorValue = getDeckColor(deck);
                      const deckCategory = getDeckCategory(deck);
                      const deckCardCount = getDeckCardCount(deck);

                      return (
                        <Link
                          key={deckId}
                          to={`/deck/${deckId}`}
                          className={styles.deckBox}
                        >
                          <div
                            className={styles.deckPreview}
                            style={{ backgroundColor: deckColorValue }}
                          ></div>

                          <div className={styles.deckText}>
                            <strong>{deck.title}</strong>
                            <p className={styles.deckCategoryText}>
                              <i className="bx bxs-book"></i>
                              <span>{deckCategory}</span>
                            </p>
                            <span className={styles.deckCardCount}>
                              {deckCardCount} cards
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}

              {activeDeckTab === "archive" && isOwnProfile && (
                <div className={styles.decksGrid}>
                  {archivedDecks.length === 0 ? (
                    <p className={styles.emptyText}>No archived decks yet</p>
                  ) : filteredArchivedDecks.length === 0 ? (
                    <p className={styles.emptyText}>
                      No archived decks found for “{search}”.
                    </p>
                  ) : (
                    filteredArchivedDecks.map((deck) => {
                      const deckId = getDeckId(deck);
                      const deckColorValue = getDeckColor(deck);
                      const deckCategory = getDeckCategory(deck);
                      const deckCardCount = getDeckCardCount(deck);

                      return (
                        <div key={deckId} className={styles.deckBox}>
                          <div className={styles.deckMenuWrapper}>
                            <button
                              type="button"
                              className={styles.deckMenuBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setArchivedDropdownOpen(
                                  archivedDropdownOpen === deckId ? null : deckId
                                );
                              }}
                            >
                              <i className="bx bx-dots-vertical-rounded"></i>
                            </button>

                            {archivedDropdownOpen === deckId && (
                              <div className={styles.deckDropdown}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRestore(deckId);
                                    setArchivedDropdownOpen(null);
                                  }}
                                >
                                  Restore
                                </button>
                              </div>
                            )}
                          </div>

                          <div
                            className={styles.deckPreview}
                            style={{ backgroundColor: deckColorValue }}
                          ></div>

                          <div className={styles.deckText}>
                            <strong>{deck.title}</strong>
                            <p className={styles.deckCategoryText}>
                              <i className="bx bxs-book"></i>
                              <span>{deckCategory}</span>
                            </p>
                            <span className={styles.deckCardCount}>
                              {deckCardCount} cards
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2200}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover={false}
        draggable={false}
      />
    </div>
  );
}

export default UserProfile;
