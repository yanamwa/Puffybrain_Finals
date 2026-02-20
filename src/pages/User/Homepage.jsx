import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import "./homepage.css";
import Calendar from "../User/calendar"; 
import TodoList from "../User/TodoList";

function Homepage() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className={`container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* ================= Sidebar ================= */}
      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="bx bx-sidebar"></i>
        </div>

        {/* Logo */}
        <div className="logo">
          <img src="/images/logo1.png" className="logo-expanded" alt="Full Logo" />
          <img src="/images/logo_solo.png" className="logo-collapsed" alt="Icon Logo" />
        </div>

        <div className="divider"></div>

        {/* Main Menu */}
        <p className="my-decks">Menu</p>
        <nav className="menu">
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <Link to="/homepage" className="menu-item active">
                <i className="bx bx-home"></i>
                <span className="menu-text">Home</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/decks" className="menu-item">
                <i className="bx bx-book"></i>
                <span className="menu-text">Decks</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/public-decks" className="menu-item">
                <i className="bx bx-folder"></i>
                <span className="menu-text">Public Decks</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="divider"></div>

        {/* My Decks */}
        <nav className="mydecks">
          <p className="my-decks">My Decks</p>
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <Link to="/lesson-networking">
                <i className="bx bx-book"></i>
                <span className="menu-text">Lesson 1 to 3 Networking</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/research-lesson-2">
                <i className="bx bx-book"></i>
                <span className="menu-text">Method of Research Lesson 2</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/research-lesson-3">
                <i className="bx bx-book"></i>
                <span className="menu-text">Method of Research Lesson 3</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <nav className="logout">
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <Link to="/login" className="logout-link" onClick={handleLogout}>
                <i className="bx bx-log-out"></i>
                <span className="menu-text">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* ================= Main Area ================= */}
      <div className="main-area">
        {/* Header */}
        <header className="header">
          <form className="search-bar">
            <input type="text" placeholder="Search your deck title" />
            <i className="bx bx-search"></i>
          </form>

          <button className="notification-btn">
            <i className="bx bx-bell"></i>
          </button>
        </header>

        {/* Main Content */}
        <main className="main-content">

          <div className="center-box">
              <h1>Hello, @meiko!</h1>
              <p>What are we going to study?</p>
              <img className="side-image" src="/images/2.png" alt="Big Image" />
         </div>

         <div className="progress">
            <h3>Continue Progress</h3>
            <div className="decks-area inner-card">
              <div className="decks-grid">
                  <Link className="deck-link">
                    <article className="deck-card">
                      <div className="card-top card-top--color1"></div>
                      <div className="card-body">
                        <p className="deck-title">Lesson 1 to 3 Networking</p>
                        <span className="deck-count">3 cards</span>
                      </div>
                    </article>
                  </Link>

                  <Link className="deck-link">
                    <article className="deck-card">
                      <div className="card-top card-top--color2"></div>
                      <div className="card-body">
                        <p className="deck-title">Methods of Research Lesson 2</p>
                        <span className="deck-count">30 cards</span>
                      </div>
                    </article>
                  </Link>

                  <Link className="deck-link">
                    <article className="deck-card">
                      <div className="card-top card-top--color3"></div>
                      <div className="card-body">
                        <p className="deck-title">Methods of Research Lesson 3</p>
                        <span className="deck-count">15 cards</span>
                      </div>
                    </article>
                  </Link>
                </div>

            </div>
         </div>

              <div className="Deck-progress">
                <div className="section-header" >
                  <h3>Deck Progress</h3>
                  <div className="section-buttons">
                    <button className="btn btn-add" onClick={() => setShowPopup(true)}>
                      Add Deck
                    </button>
                    <button className="btn btn-show" onClick={() => window.location.href='../User_Navigations/Mydecks.html'}>
                      Show All
                    </button>
                  </div>
                </div>

                <div className="decks-area inner-card">
                  <div className="decks-grid">
                    <Link className="deck-link">
                      <article className="deck-card">
                        <div className="card-top card-top--color1"></div>
                        <div className="card-body">
                          <p className="deck-title">Lesson 1 to 3 Networking</p>
                          <span className="deck-count">3 cards</span>
                        </div>
                      </article>
                    </Link>

                    <Link className="deck-link">
                      <article className="deck-card">
                        <div className="card-top card-top--color2"></div>
                        <div className="card-body">
                          <p className="deck-title">Methods of Research Lesson 2</p>
                          <span className="deck-count">30 cards</span>
                        </div>
                      </article>
                    </Link>

                    <Link className="deck-link">
                      <article className="deck-card">
                        <div className="card-top card-top--color3"></div>
                        <div className="card-body">
                          <p className="deck-title">Methods of Research Lesson 3</p>
                          <span className="deck-count">15 cards</span>
                        </div>
                      </article>
                    </Link>
                  </div>
                </div>
              </div>

        </main>


        {showPopup && (
  <div className="popup-overlay">


    <div className="popup-container">


            

      <form className="subtitle-form">

            <div className="popup-header-bar">
              <h2 className="popup-header-title">Create New Deck</h2>
            </div>
            
        <div className="form-group">
          <label className="deckinfo">Deck Title</label>
          <input type="text" className="newdecktitle" placeholder="Enter your deck name" />
        </div>

        <div className="form-group">
          <label className="deckinfo">Description</label>
          <input type="text" className="newdecktitle" placeholder="Optional description" />
        </div>

        <div className="form-group">
          <label className="deckinfo">Visibility</label>
          <div className="radio-group">
            <label className="pubpriv">
              <input type="radio" name="visibility" value="public" />
              Public
            </label>
            <label className="pubpriv">
              <input type="radio" name="visibility" value="private" />
              Private
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="deckinfo">Deck Color</label>
          <div className="color-options">
            <input type="radio" name="deckcolor" value="#C8BBD0" />
            <input type="radio" name="deckcolor" value="#E0BBD4" />
            <input type="radio" name="deckcolor" value="#C3C7F3" />
            <input type="radio" name="deckcolor" value="#90F897" />
            <input type="radio" name="deckcolor" value="#CF8686" />
            <input type="radio" name="deckcolor" value="#EECB99" />
          </div>
        </div>

        <div className="popup-divider"></div>

        <div className="startsave-container">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowPopup(false)}
          >
            Cancel
          </button>

          <button type="button" className="popadd-btn">
            Add
          </button>
        </div>

      </form>
    </div>
  </div>
)}

        {/* ================= Right Sidebar ================= */}
      <aside className="right-sidebar">
        <div className="profile-section">
          <div className="profile-avatar"></div>
          <h3 className="profile-name">@meiko</h3>
          <p className="profile-role">2nd year</p>
          <Link to="/setting-profile/user_profile" className="profile-btn">
            Profile
          </Link>
        </div>

        {/* Realtime calendar */}
        <Calendar />

        <TodoList />

        {/* Settings */}
        <Link to="/setting-profile/setting-profilee" className="settings-footer">
          ⚙ Settings
        </Link>
      </aside>

      </div>
    </div>
  );
}

export default Homepage;
