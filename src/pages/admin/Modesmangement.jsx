import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./mode.module.css";
import { LayoutDashboard, Users, BookOpen } from "lucide-react";
import Swal from "sweetalert2";

export default function ModeManagement() {
  const [modes, setModes] = useState([]);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      label: "Module Management",
      path: "/admin/modules",
      icon: <Users size={20} />,
    },
    {
      label: "Decks Management",
      path: "/admin/decks",
      icon: <BookOpen size={20} />,
    },
    {
      label: "Modes Management",
      path: "/admin/modes",
      icon: <BookOpen size={20} />,
    },
  ];

  useEffect(() => {
    fetchModes();
  }, []);

  const safeJsonParse = (text) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Invalid JSON response:", text);
      return {
        success: false,
        message: text || "PHP returned invalid JSON.",
      };
    }
  };

  const fetchModes = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getModes.php");
      const text = await res.text();

      console.log("getModes response:", text);

      const data = safeJsonParse(text);

      if (data.success) {
        setModes(data.modes || []);
      } else {
        console.error("Fetch modes failed:", data.message);
      }
    } catch (error) {
      console.error("Fetch modes error:", error);
      Swal.fire("Server Error", "Could not fetch modes.", "error");
    }
  };

  const addMode = async (modeData) => {
    if (
      !modeData.title ||
      !modeData.description ||
      !modeData.route ||
      !modeData.image
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all fields.",
      });
      return;
    }

    const form = new FormData();
    form.append("title", modeData.title.trim());
    form.append("description", modeData.description.trim());
    form.append("route", modeData.route.trim());
    form.append("image", modeData.image);

    try {
      const res = await fetch("http://localhost/puffybrain/addMode.php", {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      console.log("addMode response:", text);

      const data = safeJsonParse(text);

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Mode Added!",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchModes();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to add mode.",
        });
      }
    } catch (error) {
      console.error("Add mode error:", error);

      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Check addMode.php or the console response.",
      });
    }
  };

  const viewMode = (mode) => {
    Swal.fire({
      title: mode.title,
      html: `
        ${
          mode.image
            ? `<img src="http://localhost/puffybrain/images/${mode.image}" style="width:120px;margin-bottom:10px;">`
            : `<p><b>No image uploaded</b></p>`
        }
        <p><b>Description:</b> ${mode.description}</p>
        <p><b>Route:</b> ${mode.route}</p>
      `,
      confirmButtonText: "Close",
    });
  };

  const deleteMode = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Mode?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    const form = new FormData();
    form.append("id", id);

    try {
      const res = await fetch("http://localhost/puffybrain/deleteMode.php", {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      console.log("deleteMode response:", text);

      const data = safeJsonParse(text);

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1200,
          showConfirmButton: false,
        });

        fetchModes();
      } else {
        Swal.fire("Error", data.message || "Delete failed.", "error");
      }
    } catch (error) {
      console.error("Delete mode error:", error);
      Swal.fire("Server Error", "Check deleteMode.php.", "error");
    }
  };

  const openAddMode = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add Mode",
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Mode Title">
        <input id="swal-description" class="swal2-input" placeholder="Description">
        <input id="swal-route" class="swal2-input" placeholder="Route">
        <input id="swal-image" type="file" class="swal2-file" accept="image/*">
      `,
      showCancelButton: true,
      confirmButtonText: "Add Mode",
      preConfirm: () => {
        return {
          title: document.getElementById("swal-title").value.trim(),
          description: document.getElementById("swal-description").value.trim(),
          route: document.getElementById("swal-route").value.trim(),
          image: document.getElementById("swal-image").files[0],
        };
      },
    });

    if (formValues) {
      addMode(formValues);
    }
  };

  const editMode = async (mode) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Mode",
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Mode Title">
        <input id="swal-description" class="swal2-input" placeholder="Description">
        <input id="swal-route" class="swal2-input" placeholder="Route">
        <input id="swal-image" type="file" class="swal2-file" accept="image/*">
        <p style="font-size:13px;color:#666;margin-top:8px;">
          Leave image empty if you do not want to change it.
        </p>
      `,
      didOpen: () => {
        document.getElementById("swal-title").value = mode.title || "";
        document.getElementById("swal-description").value =
          mode.description || "";
        document.getElementById("swal-route").value = mode.route || "";
      },
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: () => {
        return {
          id: mode.id,
          title: document.getElementById("swal-title").value.trim(),
          description: document
            .getElementById("swal-description")
            .value.trim(),
          route: document.getElementById("swal-route").value.trim(),
          image: document.getElementById("swal-image").files[0],
        };
      },
    });

    if (!formValues) return;

    if (!formValues.id || !formValues.title || !formValues.description || !formValues.route) {
      Swal.fire(
        "Missing Fields",
        "Please fill in title, description, and route.",
        "warning"
      );
      return;
    }

    const form = new FormData();
    form.append("id", formValues.id);
    form.append("title", formValues.title);
    form.append("description", formValues.description);
    form.append("route", formValues.route);

    if (formValues.image) {
      form.append("image", formValues.image);
    }

    try {
      const res = await fetch("http://localhost/puffybrain/updateMode.php", {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      console.log("updateMode response:", text);

      const data = safeJsonParse(text);

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: data.message || "Mode updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchModes();
      } else {
        Swal.fire("Error", data.message || "Update failed.", "error");
      }
    } catch (error) {
      console.error("Update mode error:", error);

      Swal.fire(
        "Server Error",
        "Check updateMode.php or console response.",
        "error"
      );
    }
  };

  return (
    <div className={styles.gridContainer}>

      <aside className={styles.sidebar}>

        <div className={styles.logo}>
          <img src="/images/logo1.png" alt="logo"/>
        </div>

        <div className={styles.menuLabel}>Menu</div>

        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({isActive}) =>
              `${styles.menuItem} ${isActive ? styles.active : ""}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

      </aside>

      <main className={styles.main}>

        <h1 className={styles.pageTitle}>Mode Management</h1>

        <div className={styles.addModeContainer}>
          <button className={styles.addModeBtn} onClick={openAddMode}>
            Add Mode
          </button>
        </div>

    <div className={styles.tableHeader}>
        <div>ID</div>
        <div>Title</div>
        <div>Description</div>
        <div>Route</div>
        <div>Action</div>
    </div>

        <div className={styles.tableContent}>

          {modes.map(mode => (
            <div className={styles.row} key={mode.id}>

       <div>{mode.id}</div>
        <div>{mode.title}</div>
        <div className={styles.descCell}>{mode.description}</div>
        <div>{mode.route}</div>

  <div className={styles.actionButtons}>

 <button
      className={styles.viewBtn}
      onClick={() => viewMode(mode)}
    >
      View
    </button>

    <button
      className={styles.editBtn}
      onClick={() => editMode(mode)}
    >
      Edit
    </button>

    <button
      className={styles.deleteBtn}
      onClick={() => deleteMode(mode.id)}
    >
      Delete
    </button>

 </div>

    </div>
  ))}

</div>

      </main>

    </div>
  );
}