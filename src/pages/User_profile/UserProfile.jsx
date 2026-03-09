import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./UserProfile.module.css";

function UserProfile() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [userDetails, setUserDetails] = useState({
    username: "meiko",
    email: "meiko@gmail.com",
    school: "Cavite State University",
    yearLevel: "3rd Year",
    profileImage: "/images/default-avatar.png",
  });

  const [formData, setFormData] = useState({
    username: "meiko",
    email: "meiko@gmail.com",
    school: "Cavite State University",
    yearLevel: "3rd Year",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const myDecks = [
    "Lesson 1 to 3 Networking",
    "Methods of research lesson",
    "Methods of research lesson 2",
    "Business Analysis Lesson 1",
  ];

  const showPopup = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: userDetails.username,
      email: userDetails.email,
      school: userDetails.school,
      yearLevel: userDetails.yearLevel,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: userDetails.username,
      email: userDetails.email,
      school: userDetails.school,
      yearLevel: userDetails.yearLevel,
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    setUserDetails((prev) => ({
      ...prev,
      username: formData.username,
      email: formData.email,
      school: formData.school,
      yearLevel: formData.yearLevel,
    }));

    setIsEditing(false);
    showPopup("Profile updated successfully");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setUserDetails((prev) => ({
        ...prev,
        profileImage: previewUrl,
      }));
      showPopup("Profile updated successfully");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...passwordData,
      [name]: value,
    };

    setPasswordData(updatedData);

    if (
      updatedData.confirmPassword &&
      updatedData.newPassword !== updatedData.confirmPassword
    ) {
      setPasswordError("Password do not match");
    } else {
      setPasswordError("");
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Password do not match");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Password do not match");
      return;
    }

    setPasswordError("");
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });

    showPopup("Password updated successfully");
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible."
    );

    if (confirmDelete) {
      alert("Account deleted.");
    }
  };

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      {successMessage && (
        <div className={styles.popupOverlay}>
          <div className={styles.successPopup}>
            <p className={styles.successText}>{successMessage}</p>
            <div className={styles.successCheck}>
              <i className="bx bx-check"></i>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
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

          <div className={styles.divider}></div>

          <p className={styles.menuTitle}>Menu</p>

          <nav>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarListItem}>
                <Link to="/" className={styles.menuItem}>
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

          <div className={styles.myDecksSection}>
            <p className={styles.myDecksTitle}>My Decks</p>
            <ul className={styles.deckList}>
              {myDecks.map((deck, index) => (
                <li key={index} className={styles.deckItem}>
                  <i className="bx bx-folder"></i>
                  <span>{deck}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.logout}>
          <button className={styles.logoutLink} type="button">
            <i className="bx bx-log-out"></i>
            <span className={styles.menuText}>Logout</span>
          </button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search your decks" />
            <i className="bx bx-search"></i>
          </div>

          <div className={styles.profileWrapper}>
            <button
              className={styles.profileButton}
              onClick={() => setShowProfileMenu((prev) => !prev)}
              type="button"
            >
              <img
                src={userDetails.profileImage}
                alt="profile"
                className={styles.profileAvatar}
              />
              <i className="bx bx-chevron-down"></i>
            </button>

            {showProfileMenu && (
              <div className={styles.profileDropdown}>
                <button type="button">
                  <i className="bx bx-cog"></i>
                  <span>Settings</span>
                </button>

                <button type="button">
                  <i className="bx bx-help-circle"></i>
                  <span>FAQs</span>
                </button>

                <button type="button">
                  <i className="bx bx-log-out"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.settingsPageHeader}>
            <h2 className={styles.pageTitle}>Edit Profile</h2>
            <button className={styles.backBtn} onClick={handleBack} type="button">
              Back
            </button>
          </div>

          <div className={styles.editWrapper}>
            <div className={styles.tabs}>
              <button
                className={activeTab === "personal" ? styles.activeTab : ""}
                onClick={() => {
                  setActiveTab("personal");
                  setIsEditing(false);
                }}
                type="button"
              >
                Personal Information
              </button>

              <button
                className={activeTab === "settings" ? styles.activeTab : ""}
                onClick={() => {
                  setActiveTab("settings");
                  setIsEditing(false);
                }}
                type="button"
              >
                Settings
              </button>
            </div>

            {activeTab === "personal" && (
              <div className={styles.editCard}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>Personal Information</h3>

                  {!isEditing ? (
                    <button
                      className={styles.editBtn}
                      onClick={handleEdit}
                      type="button"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      className={styles.cancelBtn}
                      onClick={handleCancelEdit}
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className={styles.editContent}>
                  <div className={styles.formLeft}>
                    {!isEditing ? (
                      <>
                        <div className={styles.infoGroup}>
                          <label>Username</label>
                          <div className={styles.infoBox}>{userDetails.username}</div>
                        </div>

                        <div className={styles.infoGroup}>
                          <label>Email Address</label>
                          <div className={styles.infoBox}>{userDetails.email}</div>
                        </div>

                        <div className={styles.infoGroup}>
                          <label>Name of School</label>
                          <div className={styles.infoBox}>{userDetails.school}</div>
                        </div>

                        <div className={styles.infoGroup}>
                          <label>Year Level</label>
                          <div className={styles.infoBox}>{userDetails.yearLevel}</div>
                        </div>
                      </>
                    ) : (
                      <form onSubmit={handleSaveProfile}>
                        <div className={styles.infoGroup}>
                          <label>Username</label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className={styles.infoGroup}>
                          <label>Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className={styles.infoGroup}>
                          <label>Name of School</label>
                          <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className={styles.infoGroup}>
                          <label>Year Level</label>
                          <input
                            type="text"
                            name="yearLevel"
                            value={formData.yearLevel}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <button type="submit" className={styles.saveBtn}>
                          Save
                        </button>
                      </form>
                    )}
                  </div>

                  <div className={styles.photoUpload}>
                    <div className={styles.photoCircle}>
                      <img
                        src={userDetails.profileImage}
                        alt="preview"
                        className={styles.previewImage}
                      />
                    </div>

                    <p className={styles.photoHint}>
                      Recommended ratio 1:1 and
                      <br />
                      file size less than 5mb
                    </p>

                    {isEditing && (
                      <label className={styles.uploadBtn}>
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          hidden
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className={styles.settingsLayout}>
                <div className={styles.settingsCard}>
                  <h3 className={styles.settingsTitle}>Change Password</h3>

                  <form className={styles.settingsForm} onSubmit={handleSavePassword}>
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="enter your new password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />

                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="enter your confirm password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={passwordError ? styles.inputError : ""}
                    />

                    {passwordError && (
                      <span className={styles.passwordError}>
                        {passwordError}
                      </span>
                    )}

                    <button type="submit" className={styles.saveBtn}>
                      Save
                    </button>
                  </form>
                </div>

                <div className={styles.deleteCard}>
                  <h3 className={styles.deleteTitle}>Delete Account</h3>
                  <p className={styles.deleteText}>
                    Are you sure you want to delete your account? This action is
                    irreversible.
                  </p>
                  <button
                    className={styles.deleteBtn}
                    onClick={handleDeleteAccount}
                    type="button"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;