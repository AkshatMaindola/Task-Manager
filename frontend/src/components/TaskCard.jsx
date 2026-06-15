import React from 'react';
import { Calendar, Clock, Trash2, Check, RotateCcw, Pencil, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isOverdue } from '../api/taskApi';

export default function TaskCard({ task, onToggleComplete, onDelete, onEdit }) {
  const isCompleted = task.completeStatus || !!task.completedAt;
  const isTaskOverdue = !isCompleted && isOverdue(task.dueAt);

  let badgeClass = 'badge-pending';
  let badgeLabel = 'Pending';
  let BadgeIcon = Clock;

  if (isCompleted) {
    badgeClass = 'badge-completed';
    badgeLabel = 'Completed';
    BadgeIcon = CheckCircle2;
  } else if (isTaskOverdue) {
    badgeClass = 'badge-overdue';
    badgeLabel = 'Overdue';
    BadgeIcon = AlertCircle;
  }

  return (
    <div className={`glass-panel task-card ${isCompleted ? 'completed' : ''} ${isTaskOverdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.tName}</h3>
        <span className={`badge ${badgeClass}`}>
          <BadgeIcon size={12} />
          {badgeLabel}
        </span>
      </div>

      <p className="task-desc">
        {task.tDescription || <i>No description.</i>}
      </p>

      <div className="task-dates">
        <div className="date-info">
          <Calendar size={12} />
          <span>Created: {task.createdAt || 'Just now'}</span>
        </div>
        {task.dueAt && (
          <div className={`date-info due-date ${isTaskOverdue ? 'overdue' : ''}`}>
            <Clock size={12} />
            <span>Due: {task.dueAt}</span>
          </div>
        )}
        {task.completedAt && (
          <div className="date-info" style={{ color: 'var(--color-success)' }}>
            <Check size={12} />
            <span>Completed: {task.completedAt}</span>
          </div>
        )}
      </div>

      <div className="task-actions">
        <button 
          className="btn-icon" 
          onClick={() => onEdit(task)}
          title="Edit Task"
        >
          <Pencil size={14} />
        </button>
        <button 
          className="btn-icon complete" 
          onClick={() => onToggleComplete(task)}
          title={isCompleted ? "Mark Active" : "Mark Completed"}
        >
          {isCompleted ? <RotateCcw size={14} /> : <Check size={14} />}
        </button>
        <button 
          className="btn-icon delete" 
          onClick={() => onDelete(task.id)}
          title="Delete Task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
