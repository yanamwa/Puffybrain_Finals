import React, { useState } from "react";
import "./modulemanage.css";

export default function modulemanagement() {
  const [modules, setModules] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");


          useEffect(() => {
            fetch("http://localhost/puffybrain/adminLearningModule.php")
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  setModules(data.modules);
                }
              })
              .catch(err => console.error(err));
          }, []);

  const modules = [
    { id: "QZ2025A01", title: "rairai", date: "10/11/2025", status: "active" },
    { id: "BK06A2025", title: "Paps", date: "11/27/2025", status: "active" },
    { id: "BK07A2025", title: "Larah", date: "12/17/2025", status: "active" },
    { id: "BK08A2025", title: "meiko", date: "11/22/2025", status: "active" },
    { id: "BK09A2025", title: "jessy", date: "11/16/2025", status: "inactive" },
  ];

  const openModal = (module) => {
    setSelectedModule(module);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className="container">
     
      <form className="search-bar">
        <input type="text" placeholder="Search your decks" />
        <i className="bx bx-search"></i>
      </form>

     
      <aside className="sidebar">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" />
        </div>

        <p className="my-decks">Menu</p>

        <nav className="menu">
          <a href="#" className="menu-item">
            <i className="bx bx-home"></i> <span>Dashboard</span>
          </a>
          <a href="#" className="menu-item">
            <i className="bx bx-book"></i> <span>User Management</span>
          </a>
          <a href="#" className="menu-item active">
            <i className="bx bx-folder"></i> <span>Lesson Management</span>
          </a>
        </nav>

        <nav className="logout">
          <a href="#">
            <i className="bx bx-log-out"></i> <span>Logout</span>
          </a>
        </nav>
      </aside>

    
      <div className="module-header">
        <h1>Module Management</h1>
        <button className="add-module-btn">
          <i className="bx bx-plus"></i> Add New Module
        </button>
      </div>

 
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Module ID</th>
              <th>Module Title</th>
              <th>Date created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {modules.map((mod) => (
              <tr key={mod.id}>
                <td>{mod.id}</td>
                <td>{mod.title}</td>
                <td>{mod.date}</td>
                <td>
                  <span className={`status ${mod.status}`}>
                    ● {mod.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                  <button className="view-btn" onClick={() => openModal(mod)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-container">
          <div className="page-numbers">
            <button className="page-btn">‹</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">›</button>
          </div>

          <div className="rows-control">
            <span>Show</span>
            <select>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>Row</span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal active" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Module Details</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Module Title</div>
                <div className="detail-value">{selectedModule.title}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Module ID</div>
                <div className="detail-value">{selectedModule.id}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Date Created</div>
                <div className="detail-value">{selectedModule.date}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}