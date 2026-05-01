import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import styles from "./edit-profile.module.css";

function EditProfile() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0; // change this later when you have real data

  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [user, setUser] = useState({
    username: "",
    email: "",
    year_level: "",
    school: "",
    signature: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    year_level: "",
    school: "",
    profile_image: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();
      setMyDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("Failed to fetch user decks:", err);
      setMyDecks([]);
    }
  };

  const fetchAddedCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("Fetch courses error:", err);
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
        const loadedUser = {
          username: data.user?.username || data.username || "",
          email: data.user?.email || data.email || "",
          year_level: data.user?.year_level || data.year_level || "",
          school: data.user?.school || data.school || "",
          signature:
            data.user?.signature ||
            data.signature ||
            data.user?.username ||
            data.username ||
            "",
          profile_image:
            data.user?.profile_image ||
            data.profile_image ||
            "/images/temporary profile.jpg",
        };

        setUser(loadedUser);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  useEffect(() => {
    fetchUserDecks();
    fetchAddedCourses();
    fetchUser();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
  `.${styles.deckMenu}, .${styles.deckMenuBtn}, .${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}`
);

      if (!insideDropdown) {
        setDropdownOpen(null);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsEditModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) navigate("/login");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const newPassword = passwordForm.newPassword;

const hasLength = newPassword.length >= 12;
const hasUpper = /[A-Z]/.test(newPassword);
const hasLower = /[a-z]/.test(newPassword);
const hasNumber = /[0-9]/.test(newPassword);
const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

const isPasswordValid =
  hasLength && hasUpper && hasLower && hasNumber && hasSymbol;

const passwordsMatch =
  passwordForm.newPassword === passwordForm.confirmPassword;

const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength === 3 || strength === 4) return "medium";
  return "strong";
};

const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async (e) => {
  e.preventDefault();

  if (!isPasswordValid) {
  alert("Password must meet all security requirements.");
  return;
}

  if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
    alert("Please fill in both password fields.");
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch("http://localhost/puffybrain/changePassword.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newPassword: passwordForm.newPassword,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Password changed successfully!");
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      alert(data.message || "Failed to change password.");
    }
  } catch (err) {
    console.error("Change password error:", err);
    alert("Server error while changing password.");
  }
};

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible."
    );

    if (confirmed) {
      alert("Delete account functionality can be connected to your backend.");
    }
  };

  const openEditModal = () => {
  setEditForm({
    username: "",
    email: "",
    year_level: "",
    school: "",
    profile_image: "",
  });

  setIsEditModalOpen(true);
};

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setSelectedImageFile(file);

  const previewUrl = URL.createObjectURL(file);

  setEditForm((prev) => ({
    ...prev,
    profile_image: previewUrl,
  }));
};

  const handleSaveProfile = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("username", editForm.username);
  formData.append("email", editForm.email);
  formData.append("school", editForm.school);
  formData.append("year_level", editForm.year_level);

  if (selectedImageFile) {
    formData.append("profile_image", selectedImageFile);
  }

  try {
    const res = await fetch("http://localhost/puffybrain/updateUser.php", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      await fetchUser();
      setSelectedImageFile(null);
      setIsEditModalOpen(false);
      alert("Profile updated successfully!");
    } else {
      alert(data.message || "Failed to update profile.");
    }
  } catch (err) {
    console.error("Update profile error:", err);
    alert("Server error while updating profile.");
  }
};

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
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
                  to="/Mydecks"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-book"></i>
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
                  <i className="bx bx-book"></i>
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
                  <i className="bx bx-folder"></i>
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
                  <li className={styles.sidebarEmptyText}>
                    Don't have decks yet
                  </li>
                ) : (
                  myDecks.slice(0, 3).map((deck) => (
                    <li key={deck.id} className={styles.sidebarListItem}>
                      <Link to={`/deck/${deck.id}`} className={styles.menuItem}>
                        <i className="bx bx-book"></i>
                        <span className={styles.menuText}>{deck.title}</span>
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
                  <li className={styles.sidebarEmptyText}>
                    No courses added yet
                  </li>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <li key={course.id} className={styles.sidebarListItem}>
                      <button
                        type="button"
                        onClick={() => openCourse(course.id)}
                        className={styles.menuItem}
                      >
                        <i className="bx bx-book"></i>
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
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                                    setProfileDropdownOpen(false);
                                    setDropdownOpen(null);
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

              <div className={styles.dpContainer}>
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className={styles.profilePic}
                />
              </div>

              <div className={styles.userInfo}>
                <p>{user.username || "User"}</p>
              </div>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div
                  className={`${styles.dropdownContent} ${
                    dropdownOpen ? styles.show : ""
                  }`}
                >
                  <NavLink to="/edit-profile">
                    <i className="bx bx-cog" />
                    <span>Settings</span>
                  </NavLink>

                  <NavLink to="/faq">
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
            <div className={styles.pageHeader}>
              <h1 className={styles.profileTitle}>Profile</h1>
            </div>

            <div className={styles.profilePage}>
              <div className={styles.profileOuter}>
                <div className={styles.profileInner}>
                  <div className={styles.profileCard}>
                    <div className={styles.profileTabs}>
                      <button
                        type="button"
                        className={`${styles.tabBtn} ${
                          activeTab === "personal" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("personal")}
                      >
                        Personal Information
                      </button>

                      <button
                        type="button"
                        className={`${styles.tabBtn} ${
                          activeTab === "settings" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("settings")}
                      >
                        Settings
                      </button>
                    </div>

                    {activeTab === "personal" ? (
                      <>
                        <div className={styles.editTop}>
                          <button
                            className={styles.editBtn}
                            type="button"
                            onClick={openEditModal}
                          >
                            Edit
                          </button>
                        </div>

                        <div className={styles.profileContent}>
                          <div className={styles.profileForm}>
                            <div className={styles.formGroup}>
                              <label>Username</label>
                              <input
                                type="text"
                                value={user.username}
                                readOnly
                              />
                            </div>

                            <div className={styles.formGroup}>
                              <label>Email Address</label>
                              <input type="email" value={user.email} readOnly />
                            </div>

                            <div className={styles.formGroup}>
                              <label>Name of School</label>
                              <input type="text" value={user.school} readOnly />
                            </div>

                            <div className={styles.formGroup}>
                              <label>Year Level</label>
                              <input
                                type="text"
                                value={user.year_level}
                                readOnly
                              />
                            </div>
                          </div>

                          <div className={styles.profileImageSection}>
                            <img
                              src={user.profile_image}
                              alt="Profile"
                              className={styles.largeProfilePic}
                            />
                            <p className={styles.imageHint}>
                              Recommend ratio 1:1
                              <br />
                              and file less than 5mb
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.settingsContent}>
                        <div className={styles.settingsCard}>
                          <h2 className={styles.settingsHeading}>
                            Change Password
                          </h2>

                          <div className={styles.settingsDivider}></div>

                          <form
                            className={styles.settingsBody}
                            onSubmit={handleChangePassword}
                          >
                            <div className={styles.passwordGroup}>
                              <label>New Password</label>
                              <div className={styles.passwordInputWrap}>
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  name="newPassword"
                                  placeholder="Enter new password"
                                  value={passwordForm.newPassword}
                                  onChange={handlePasswordChange}
                                />
                                <button
                                  type="button"
                                  className={styles.eyeBtn}
                                  onClick={() =>
                                    setShowNewPassword((prev) => !prev)
                                  }
                                >
                                  <i
                                    className={`bx ${
                                      showNewPassword
                                        ? "bx-hide"
                                        : "bx-show-alt"
                                    }`}
                                  ></i>
                                </button>
                              </div>
                              {passwordForm.newPassword.length > 0 && (
                                <div className={styles.passwordBox}>
                                  <div className={styles.passwordChecklist}>
                                    <p className={hasLength ? styles.valid : styles.invalid}>
                                      {hasLength ? "✓" : "✗"} At least 12 characters
                                    </p>

                                    <p className={hasUpper ? styles.valid : styles.invalid}>
                                      {hasUpper ? "✓" : "✗"} Has uppercase letter
                                    </p>

                                    <p className={hasLower ? styles.valid : styles.invalid}>
                                      {hasLower ? "✓" : "✗"} Has lowercase letter
                                    </p>

                                    <p className={hasNumber ? styles.valid : styles.invalid}>
                                      {hasNumber ? "✓" : "✗"} Has number
                                    </p>

                                    <p className={hasSymbol ? styles.valid : styles.invalid}>
                                      {hasSymbol ? "✓" : "✗"} Has special character
                                    </p>
                                  </div>

                                  <div
                                    className={`${styles.validationMessage} ${
                                      passwordStrength === "strong"
                                        ? styles.success
                                        : passwordStrength === "medium"
                                        ? styles.warning
                                        : styles.error
                                    }`}
                                  >
                                    {passwordStrength === "weak" && "Weak password"}
                                    {passwordStrength === "medium" && "Medium strength password"}
                                    {passwordStrength === "strong" && "✓ Strong password"}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className={styles.passwordGroup}>
                              <label>Confirm New Password</label>
                              <div className={styles.passwordInputWrap}>
                                <input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  name="confirmPassword"
                                  placeholder="Confirm new password"
                                  value={passwordForm.confirmPassword}
                                  onChange={handlePasswordChange}
                                />
                                <button
                                  type="button"
                                  className={styles.eyeBtn}
                                  onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                  }
                                >
                                  <i
                                    className={`bx ${
                                      showConfirmPassword
                                        ? "bx-hide"
                                        : "bx-show-alt"
                                    }`}
                                  ></i>
                                </button>
                              </div>
                              {passwordForm.confirmPassword.length > 0 && (
                                <div className={styles.confirmBox}>
                                  <div
                                    className={`${styles.validationMessage} ${
                                      passwordsMatch ? styles.success : styles.error
                                    }`}
                                  >
                                    {passwordsMatch
                                      ? "✓ Passwords match"
                                      : "Passwords do not match"}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="submit"
                              className={styles.changePasswordBtn}
                            >
                              Change password
                            </button>
                          </form>
                        </div>

                        <div className={styles.settingsCard}>
                          <h2
                            className={`${styles.settingsHeading} ${styles.deleteHeading}`}
                          >
                            Delete Account
                          </h2>

                          <div className={styles.settingsDivider}></div>

                          <div className={styles.deleteBody}>
                            <p className={styles.deleteText}>
                              Are you sure you want to delete your account? This
                              action is irreversible.
                            </p>

                            <button
                              type="button"
                              className={styles.deleteAccountBtn}
                              onClick={handleDeleteAccount}
                            >
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditModalOpen && (
              <div className={styles.modalOverlay} onClick={closeEditModal}>
                <div
                  className={styles.editModal}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.modalCloseBtn}
                    onClick={closeEditModal}
                  >
                    <i className="bx bx-x"></i>
                  </button>

                  <div className={styles.modalTabs}>
                    <button
                      type="button"
                      className={`${styles.modalTabBtn} ${styles.modalTabActive}`}
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className={styles.modalCard}>
                    <h2 className={styles.modalTitle}>About you</h2>
                    <div className={styles.modalDivider}></div>

                    <form
                      className={styles.modalContent}
                      onSubmit={handleSaveProfile}
                    >
                      <div className={styles.modalForm}>
                        <div className={styles.modalFormGroup}>
                          <label>Username</label>
                          <input
                            type="text"
                            name="username"
                            value={editForm.username || ""}
                            onChange={handleEditInputChange}
                            placeholder="Enter your username"
                          />
                        </div>

                        <div className={styles.modalFormGroup}>
                          <label>Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={editForm.email || ""}
                            onChange={handleEditInputChange}
                            placeholder="Enter your email address"
                          />
                        </div>

                        <div className={styles.modalFormGroup}>
                          <label>Name of School</label>
                          <input
                            type="text"
                            name="school"
                            value={editForm.school || ""}
                            onChange={handleEditInputChange}
                            placeholder="Enter your school name"
                          />
                        </div>

                        <div className={styles.modalFormGroup}>
                          <label>Year Level</label>
                          <input
                            type="text"
                            name="year_level"
                            value={editForm.year_level || ""}
                            onChange={handleEditInputChange}
                            placeholder="Enter your year level"
                          />
                        </div>

                        <div className={styles.modalActions}>
                          <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={closeEditModal}
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            className={styles.saveChangesBtn}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>

                      <div className={styles.modalPhotoSection}>
                        <label className={styles.uploadPhotoCircle}>
                          {editForm.profile_image ? (
                            <img
                              src={editForm.profile_image}
                              alt="Preview"
                              className={styles.uploadedPreview}
                            />
                          ) : (
                            <>
                              <i className="bx bx-camera"></i>
                              <span>Upload Photo</span>
                            </>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            hidden
                          />
                        </label>

                        <p className={styles.uploadHint}>
                          Recommend ratio 1:1
                          <br />
                          and file less than 5mb
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;