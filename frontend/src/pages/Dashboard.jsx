import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { sprintApi } from '../api/client.js';

export default function Dashboard() {
  const [sprints, setSprints] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setStatus('loading');
    sprintApi.list()
      .then((data) => {
        setSprints(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.startDate || !form.endDate) {
      setFormError('Fill in a name and both dates.');
      return;
    }
    setSubmitting(true);
    try {
      await sprintApi.create(form);
      setForm({ name: '', startDate: '', endDate: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Sprints</h1>
          <p className="page-sub">Every sprint you're tracking, with this week's completion.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New sprint'}
        </button>
      </div>

      {showForm && (
        <form className="sprint-form" onSubmit={handleCreate}>
          <label>
            Sprint name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Sprint 14 — Checkout revamp"
            />
          </label>
          <label>
            Start date
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </label>
          <label>
            End date
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </label>
          {formError && <p className="form-error">{formError}</p>}
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create sprint'}
          </button>
        </form>
      )}

      {status === 'loading' && <p className="state-text">Loading sprints…</p>}
      {status === 'error' && <p className="state-text">Couldn't load sprints. Is the backend running?</p>}

      {status === 'ready' && sprints.length === 0 && (
        <div className="empty-state">
          <p>No sprints yet. Create one to start tracking daily tasks and hours.</p>
        </div>
      )}

      {status === 'ready' && sprints.length > 0 && (
        <div className="sprint-grid">
          {sprints.map((s) => (
            <Link to={`/sprints/${s.id}`} key={s.id} className="sprint-card">
              <div className="sprint-card__top">
                <h3>{s.name}</h3>
                <span className="sprint-card__percent">{s.progressPercent}%</span>
              </div>
              <div className="sprint-card__bar">
                <div className="sprint-card__bar-fill" style={{ width: `${s.progressPercent}%` }} />
              </div>
              <div className="sprint-card__meta">
                <span>{s.startDate} → {s.endDate}</span>
                <span>{s.completedTasks}/{s.totalTasks} tasks</span>
              </div>
              <div className="sprint-card__hours">
                <span className="mono">{s.totalLoggedHours}h</span> logged of <span className="mono">{s.totalEstimatedHours}h</span> estimated
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
