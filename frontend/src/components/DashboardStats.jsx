import React from 'react';
import { ListTodo, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { isOverdue } from '../api/taskApi';

export default function DashboardStats({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completeStatus || t.completedAt).length;
  const active = total - completed;
  const overdue = tasks.filter(t => !t.completeStatus && !t.completedAt && isOverdue(t.dueAt)).length;

  const statItems = [
    {
      label: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'var(--color-primary)',
      bgColor: 'rgba(99, 102, 241, 0.15)',
    },
    {
      label: 'Active',
      value: active,
      icon: Clock,
      color: 'var(--color-secondary)',
      bgColor: 'rgba(6, 182, 212, 0.15)',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'var(--color-success)',
      bgColor: 'rgba(16, 185, 129, 0.15)',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'var(--color-danger)',
      bgColor: 'rgba(239, 68, 68, 0.15)',
    },
  ];

  return (
    <div className="stats-container">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="glass-panel stat-card">
            <div 
              className="stat-icon-wrapper" 
              style={{ backgroundColor: item.bgColor }}
            >
              <Icon className="stat-icon" style={{ color: item.color }} />
            </div>
            <div className="stat-info">
              <span className="stat-val">{item.value}</span>
              <span className="stat-lbl">{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
