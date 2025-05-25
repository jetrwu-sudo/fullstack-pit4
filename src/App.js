import React, { useState, useEffect } from "react";

const API_URL = "https://todo-backend-zey7.onrender.com";

export default function UniqueTodo() {
  const [tasks, setTasks] = useState([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark-mode class on body for full page effect
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [darkMode]);

  useEffect(() => {
    (async () => {
      try {
        let url = `${API_URL}/tasks`;
        if (filter === "completed") url += "?completed=true";
        else if (filter === "pending") url += "?completed=false";

        const response = await fetch(url);
        if (!response.ok) throw new Error("Fetch error");
        const data = await response.json();
        setTasks(data);
      } catch (e) {
        alert(e.message);
      }
    })();
  }, [filter]);

  async function addTask(e) {
    e.preventDefault();
    if (!draft.trim()) return;

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.trim() }),
      });
      if (!res.ok) throw new Error("Add failed");
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setDraft("");
    } catch (e) {
      alert(e.message);
    }
  }

  async function toggleTask(task) {
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, completed: !task.completed }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteTask(id) {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  function startEdit(task) {
    setEditing(task.id);
    setEditValue(task.title);
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  async function saveEdit(task) {
    if (!editValue.trim()) return alert("Cannot be empty");
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editValue.trim(), completed: task.completed }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      cancelEdit();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <main className="unique-wrapper">
      <header className="header-bar">
        <h1 className="main-title">your tasks</h1>
        <button
          className="dark-toggle"
          onClick={() => setDarkMode((d) => !d)}
          aria-label="Toggle dark mode"
          type="button"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <form className="invisible-form" onSubmit={addTask} noValidate>
        <input
          className="ghost-input"
          placeholder="press enter to add..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck="false"
          aria-label="Add new task"
        />
      </form>

      <nav className="filter-links" aria-label="task filters">
        {["all", "completed", "pending"].map((f) => (
          <span
            key={f}
            onClick={() => setFilter(f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setFilter(f)}
            className={`filter-item ${filter === f ? "selected" : ""}`}
          >
            {f}
          </span>
        ))}
      </nav>

      <ul className="task-lines" aria-live="polite">
        {tasks.length === 0 && <li className="empty-message">no tasks found</li>}

        {tasks.map((task) => (
          <li key={task.id} className="task-line">
            <label
              className={`task-text ${task.completed ? "done" : ""}`}
              onDoubleClick={() => startEdit(task)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && startEdit(task)}
              aria-label={`Toggle task ${task.title}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                tabIndex={-1}
                aria-hidden="true"
              />
              {editing === task.id ? (
                <input
                  type="text"
                  className="edit-line"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  spellCheck="false"
                  aria-label={`Editing ${task.title}`}
                />
              ) : (
                <span>{task.title}</span>
              )}
            </label>

            {editing === task.id ? (
              <>
                <button
                  className="text-btn save-btn"
                  onClick={() => saveEdit(task)}
                  aria-label="save task"
                >
                  ✓
                </button>
                <button
                  className="text-btn cancel-btn"
                  onClick={cancelEdit}
                  aria-label="cancel editing"
                >
                  ✕
                </button>
              </>
            ) : (
              <button
                className="text-btn delete-btn"
                onClick={() => deleteTask(task.id)}
                aria-label={`delete ${task.title}`}
              >
                🗑
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="hint-text">
        double-click or hit enter on task to edit • press enter to add
      </p>
    </main>
  );
}
