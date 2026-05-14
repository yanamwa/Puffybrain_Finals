import { useState } from "react";
import styles from "./TodoList.module.css";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState("");

  const openModal = () => {
    setShowModal(true);
    setNewTask("");
  };

  const closeModal = () => {
    setShowModal(false);
    setNewTask("");
  };

  const addTodo = () => {
    if (newTask && newTask.trim() !== "") {
      setTodos([...todos, newTask]);
      closeModal();
    }
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  return (
    <>
      <div className={styles.todoSection}>
        <div className={styles.todoHeader}>
          <h4>To-Do List</h4>
          <button className={styles.addBtn} onClick={openModal}>+</button>
        </div>

        <ul className={styles.todoList}>
          {todos.map((todo, index) => (
          <li key={index} className={styles.todoItem}>
  <label className={styles.checkboxContainer}>
    <input type="checkbox" />
    <span className={styles.customCheckbox}></span>
  </label>

  <span className={styles.todoText}>{todo}</span>

  <button
    className={styles.deleteBtn}
    onClick={() => removeTodo(index)}
  >
    ×
  </button>
</li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add New Task</h2>
            </div>

            <div className={styles.modalBody}>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter your task..."
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={addTodo}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TodoList;
