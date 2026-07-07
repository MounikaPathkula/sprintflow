import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import { sprintApi, taskApi } from "../api/client.js";

const STATUS_LABELS = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function enumerateDates(start, end) {
  const dates = [];
  let cur = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (cur <= last) {
    dates.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function SprintBoard() {
  const { id } = useParams();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    taskDate: "",
    estimatedHours: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hourDrafts, setHourDrafts] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [previousStatus, setPreviousStatus] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  function load() {
    setStatus("loading");
    Promise.all([sprintApi.get(id), taskApi.listForSprint(id)])
      .then(([s, t]) => {
        setSprint(s);
        setTasks(t);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, [id]);

  const allDates = useMemo(() => {
    if (!sprint) return [];
    return enumerateDates(sprint.startDate, sprint.endDate);
  }, [sprint]);

  const tasksByDate = useMemo(() => {
    const map = {};
    for (const date of allDates) map[date] = [];
    for (const t of tasks) {
      if (!map[t.taskDate]) map[t.taskDate] = [];
      map[t.taskDate].push(t);
    }
    return map;
  }, [tasks, allDates]);

  const dayStates = useMemo(() => {
    return allDates.map((date) => {
      const dayTasks = tasksByDate[date] || [];
      if (dayTasks.length === 0) return "empty";
      if (dayTasks.some((t) => t.status === "BLOCKED")) return "blocked";
      if (dayTasks.every((t) => t.status === "DONE")) return "done";
      if (
        dayTasks.some((t) => t.status === "DONE" || t.status === "IN_PROGRESS")
      )
        return "partial";
      return "empty";
    });
  }, [allDates, tasksByDate]);

  async function handleCreateTask(e) {
    e.preventDefault();
    setFormError("");
    if (!form.title || !form.taskDate || form.estimatedHours === "") {
      setFormError("Fill in a title, date, and estimated hours.");
      return;
    }
    setSubmitting(true);
    try {
      await taskApi.create({
        sprintId: Number(id),
        title: form.title,
        description: form.description,
        taskDate: form.taskDate,
        estimatedHours: Number(form.estimatedHours),
      });
      setForm({ title: "", description: "", taskDate: "", estimatedHours: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // async function handleStatusChange(taskId, newStatus) {
  //   await taskApi.update(taskId, { status: newStatus });
  //   load();
  // }

  async function confirmStatusChange() {
    try {
      await taskApi.update(selectedTask.id, { status: newStatus });
      setOpenConfirm(false);
      setSelectedTask(null);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  function cancelStatusChange() {
    setOpenConfirm(false);
    setSelectedTask(null);
    load();
  }
  function handleStatusChange(task, status) {
    setSelectedTask(task);
    setPreviousStatus(task.status);
    setNewStatus(status);
    setOpenConfirm(true);
  }
  async function handleLogHours(taskId) {
    const raw = hourDrafts[taskId];
    const hours = Number(raw);
    if (!raw || isNaN(hours) || hours <= 0) return;
    await taskApi.logHours(taskId, hours);
    setHourDrafts((prev) => ({ ...prev, [taskId]: "" }));
    load();
  }

  async function handleDelete(taskId) {
    await taskApi.remove(taskId);
    load();
  }

  if (status === "loading") {
    return (
      <Layout>
        <p className="state-text">Loading sprint…</p>
      </Layout>
    );
  }

  if (status === "error" || !sprint) {
    return (
      <Layout>
        <p className="state-text">Couldn't load this sprint.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="board-header">
        <div>
          <span className="eyebrow">
            {sprint.startDate} → {sprint.endDate}
          </span>
          <h1>{sprint.name}</h1>
          <p className="page-sub">
            {sprint.completedTasks} of {sprint.totalTasks} tasks done · created
            by {sprint.createdByName}
          </p>
        </div>
        <ProgressRing dayStates={dayStates} percent={sprint.progressPercent} />
      </div>

      <div className="board-toolbar">
        <div className="hours-summary">
          <span className="mono hours-summary__value">
            {sprint.totalLoggedHours}h
          </span>
          <span className="hours-summary__label">logged of</span>
          <span className="mono hours-summary__value">
            {sprint.totalEstimatedHours}h
          </span>
          <span className="hours-summary__label">estimated</span>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ Add task"}
        </button>
      </div>

      {showForm && (
        <form className="task-form" onSubmit={handleCreateTask}>
          <label>
            Task title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Build login form"
            />
          </label>
          <label>
            Notes (optional)
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.taskDate}
              min={sprint.startDate}
              max={sprint.endDate}
              onChange={(e) => setForm({ ...form, taskDate: e.target.value })}
            />
          </label>
          <label>
            Estimated hours
            <input
              type="number"
              step="0.5"
              min="0"
              value={form.estimatedHours}
              onChange={(e) =>
                setForm({ ...form, estimatedHours: e.target.value })
              }
            />
          </label>
          {formError && <p className="form-error">{formError}</p>}
          <button
            className="btn btn--primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Adding…" : "Add task"}
          </button>
        </form>
      )}

      <div className="day-list">
        {allDates.map((date) => {
          const dayTasks = tasksByDate[date] || [];
          const weekday = new Date(date + "T00:00:00").toLocaleDateString(
            undefined,
            { weekday: "short", month: "short", day: "numeric" },
          );
          return (
            <div className="day-block" key={date}>
              <div className="day-block__header">
                <span>{weekday}</span>
                <span className="day-block__count">
                  {dayTasks.length} task{dayTasks.length === 1 ? "" : "s"}
                </span>
              </div>

              {dayTasks.length === 0 && (
                <p className="day-block__empty">
                  No tasks planned for this day.
                </p>
              )}

              {dayTasks.map((t) => (
                <div
                  className={`task-row task-row--${t.status.toLowerCase()}`}
                  key={t.id}
                >
                  <div className="task-row__main">
                    <span className="task-row__title">{t.title}</span>
                    {t.description && (
                      <span className="task-row__desc">{t.description}</span>
                    )}
                    <span className="task-row__assignee">
                      {t.assignedToName}
                    </span>
                  </div>

                  {/* <select
                    className={`status-pill status-pill--${t.status.toLowerCase()}`}
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select> */}
                  <select
                    className={`status-pill status-pill--${t.status.toLowerCase()}`}
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="task-row__hours">
                    <span className="mono">{t.loggedHours}h</span> /{" "}
                    <span className="mono">{t.estimatedHours}h</span>
                  </div>

                  <div className="task-row__log">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="+hrs"
                      value={hourDrafts[t.id] || ""}
                      onChange={(e) =>
                        setHourDrafts((prev) => ({
                          ...prev,
                          [t.id]: e.target.value,
                        }))
                      }
                    />
                    <button onClick={() => handleLogHours(t.id)}>Log</button>
                  </div>

                  <button
                    className="task-row__delete"
                    onClick={() => handleDelete(t.id)}
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {openConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Status Change</h3>

            <p>
              Are you sure you want to change the status from
              <strong> {STATUS_LABELS[previousStatus]} </strong>
              to
              <strong> {STATUS_LABELS[newStatus]} </strong>?
            </p>

            <div className="modal-buttons">
              <button className="btn" onClick={cancelStatusChange}>
                Cancel
              </button>

              <button
                className="btn btn--primary"
                onClick={confirmStatusChange}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
