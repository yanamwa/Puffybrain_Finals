import { useState } from "react";
import Swal from "sweetalert2";

export default function AdminBackupRestore() {
  const [restoreFile, setRestoreFile] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = () => {
    window.location.href = "http://localhost/puffybrain/backupDatabase.php";
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      Swal.fire("Missing File", "Please choose a .sql backup file.", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Restore Database?",
      text: "This will overwrite current database data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, restore",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append("backup_file", restoreFile);

    try {
      setIsRestoring(true);

      const res = await fetch("http://localhost/puffybrain/restoreDatabase.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Success", data.message, "success");
        setRestoreFile(null);
      } else {
        Swal.fire("Failed", data.message || "Restore failed.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Server Error", "Could not restore database.", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <main>
      <h1>Backup & Restore</h1>

      <section>
        <h2>Backup Database</h2>
        <p>Download a copy of the current database.</p>

        <button type="button" onClick={handleBackup}>
          Download Backup
        </button>
      </section>

      <section>
        <h2>Restore Database</h2>
        <p>Upload a .sql file to restore the database.</p>

        <input
          type="file"
          accept=".sql"
          onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
        />

        <button type="button" onClick={handleRestore} disabled={isRestoring}>
          {isRestoring ? "Restoring..." : "Restore Database"}
        </button>
      </section>
    </main>
  );
}
