import React from 'react';
import { Clock, Check, RotateCcw, Pencil, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { parseBackendDate } from '../api/taskApi';

function getRelativeDueTime(dueAtStr, completeStatus) {
  if (completeStatus) return { label: 'Completed', type: 'completed' };
  if (!dueAtStr) return { label: 'No due date', type: 'none' };

  const due = parseBackendDate(dueAtStr);
  if (!due) return { label: 'No due date', type: 'none' };

  const now = new Date();
  const diffMs = due - now;
  
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMs < 0) {
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    if (absDays >= 1) return { label: `Overdue by ${absDays}d`, type: 'overdue' };
    if (absHours >= 1) return { label: `Overdue by ${absHours}h`, type: 'overdue' };
    return { label: `Overdue by ${Math.abs(diffMins)}m`, type: 'overdue' };
  } else {
    if (diffDays >= 1) return { label: `Due in ${diffDays}d`, type: 'active' };
    if (diffHours >= 1) return { label: `Due in ${diffHours}h`, type: 'active' };
    return { label: `Due in ${diffMins}m`, type: 'active' };
  }
}

export default function TaskCard({ task, onToggleComplete, onDelete, onEdit }) {
  const isCompleted = task.completeStatus || !!task.completedAt;
  const dueInfo = getRelativeDueTime(task.dueAt, isCompleted);
  const isOverdue = dueInfo.type === 'overdue';

  return (
    <div className={`task-card ${isCompleted ? 'card-completed' : ''} ${isOverdue ? 'card-overdue' : ''}`}>
      <div className="task-card-header">
        <h3 className="task-card-title">{task.tName}</h3>
      </div>

      {task.tDescription && (
        <p className="task-desc task-card-desc">{task.tDescription}</p>
      )}

      <div className="task-card-footer">
        <div className={`time-counter counter-${dueInfo.type}`}>
          <Clock size={12} />
          <span>{dueInfo.label}</span>
        </div>

        <div className="card-action-buttons">
          <button 
            className="action-btn-circle" 
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Pencil size={12} />
          </button>
          
          <button 
            className="action-btn-circle action-complete" 
            onClick={() => onToggleComplete(task)}
            title={isCompleted ? "Mark Active" : "Mark Completed"}
          >
            {isCompleted ? <RotateCcw size={12} /> : <Check size={12} />}
          </button>

          <button 
            className="action-btn-circle action-delete" 
            onClick={() => onDelete(task.id)}
            title="Delete Task"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
