import { useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = () => {
    const task = prompt("Enter new task:");
    if (task && task.trim() !== "") {
      setTodos([...todos, task]);
    }
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  return (
    <div className="todo-section">
      <div className="todo-header">
        <h4>To-Do List</h4>
        <button className="add-btn" onClick={addTodo}>+</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={index}>
            <span>{todo}</span>
            <button onClick={() => removeTodo(index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
