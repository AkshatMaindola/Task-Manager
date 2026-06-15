import React, { useState, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { formatDateToBackend, backendDateToIso } from '../api/taskApi';

export default function TaskForm({ onSubmit, editingTask, onCancelEdit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.tName || '');
      setDescription(editingTask.tDescription || '');
      setDueAt(editingTask.dueAt ? backendDateToIso(editingTask.dueAt) : '');
    } else {
      setName('');
      setDescription('');
      setDueAt('');
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedDueDate = dueAt ? formatDateToBackend(dueAt) : null;

    const taskData = {
      ...(editingTask || {}),
      tName: name.trim(),
      tDescription: description.trim(),
      dueAt: formattedDueDate,
      ...(!editingTask ? { completeStatus: false } : {}) // Default status for new task
    };

    onSubmit(taskData);
    
    if (!editingTask) {
      setName('');
      setDescription('');
      setDueAt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel sidebar-panel" style={{ padding: '1.25rem' }}>
      <div>
        <h2 className="form-title">
          {editingTask ? 'Edit Task' : 'Add Task'}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {editingTask ? 'Modify your task details' : 'Create a new task item'}
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="task-name">Task Name *</label>
        <input
          id="task-name"
          type="text"
          className="form-input"
          placeholder="e.g. Design Landing Page"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          className="form-textarea"
          placeholder="What needs to be done?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="task-due">Due Date & Time</label>
        <input
          id="task-due"
          type="datetime-local"
          className="form-input"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {editingTask ? (
            <>
              <Check size={16} /> Save
            </>
          ) : (
            <>
              <Plus size={16} /> Add Task
            </>
          )}
        </button>
        {editingTask && (
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancelEdit}
            title="Cancel Edit"
            style={{ padding: '0.5rem' }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
