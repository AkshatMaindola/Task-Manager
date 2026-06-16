import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Save } from 'lucide-react';
import { formatDateToBackend, backendDateToIso } from '../api/taskApi';

export default function TaskForm({ isOpen, onSubmit, editingTask, onClose }) {
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
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedDueDate = dueAt ? formatDateToBackend(dueAt) : null;

    // Build the payload
    // Notice: we do NOT generate an id client-side if it's a new task,
    // since the database now auto-generates it!
    const taskData = {
      ...(editingTask || {}),
      tName: name.trim(),
      tDescription: description.trim(),
      dueAt: formattedDueDate,
      completeStatus: editingTask ? editingTask.completeStatus : false
    };

    onSubmit(taskData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {editingTask ? 'Edit Task' : 'Create Task'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-name">Task Name *</label>
            <input
              id="task-name"
              type="text"
              className="form-input"
              placeholder="e.g. Design UI Mockups"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Describe the task details..."
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

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? (
                <>
                  <Save size={16} /> Save Changes
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
