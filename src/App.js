import React, { useState, useEffect } from "react";

const BASE_URL = "https://fullstack-backend-gak5.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    loadTasks(filter);
  }, [filter]);

  async function loadTasks(filterVal) {
    try {
      let url = `${BASE_URL}/tasks`;
      if (filterVal === "completed") url += "?completed=true";
      else if (filterVal === "pending") url += "?completed=false";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
      setNewTitle("");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleToggleComplete(task) {
    try {
      const res = await fetch(`${BASE_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, completed: !task.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDeleteTask(id) {
    try {
      const res = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      alert(error.message);
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditText(task.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEditing(task) {
    if (!editText.trim()) return alert("Task title cannot be empty");
    try {
      const res = await fetch(`${BASE_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editText.trim(), completed: task.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      cancelEditing();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      <header>
        <h1>Cozy To-Do List</h1>
        <button
          aria-label="Toggle dark mode"
          className="dark-toggle"
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </button>
      </header>

      <form onSubmit={handleAddTask} className="task-form" autoComplete="off">
        <input
          type="text"
          placeholder="What do you want to do today?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="task-input"
        />
        <button type="submit" className="btn-primary">
          Add Task
        </button>
      </form>

      <nav className="filters" role="navigation" aria-label="Task Filters">
        {["all", "completed", "pending"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            aria-pressed={filter === f}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </nav>

      <ul className="task-list" aria-live="polite">
        {tasks.length === 0 && <li className="no-tasks">No tasks yet</li>}

        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? "completed" : ""}`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleComplete(task)}
              id={`chk-${task.id}`}
              aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
            />
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-input"
                  aria-label={`Edit task ${task.title}`}
                  autoFocus
                />
                <button
                  onClick={() => saveEditing(task)}
                  className="btn-save"
                  aria-label="Save changes"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="btn-cancel"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <label
                  htmlFor={`chk-${task.id}`}
                  onDoubleClick={() => startEditing(task)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startEditing(task);
                  }}
                  className="task-label"
                  title="Double-click or press Enter to edit"
                >
                  {task.title}
                </label>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="btn-delete"
                  aria-label={`Delete task ${task.title}`}
                >
                  🗑️
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <footer className="footer">
        * Double-click or press Enter on a task to edit it.
      </footer>
    </div>
  );
}

export default App;
