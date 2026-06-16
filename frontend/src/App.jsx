import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Loader2, 
  AlertCircle, 
  Sun, 
  Moon, 
  LayoutGrid, 
  List, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Check,
  Pencil,
  RefreshCw
} from 'lucide-react';
import { taskApi, isOverdue, parseBackendDate } from './api/taskApi';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueAt'); // 'dueAt', 'createdAt', 'name'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  // Theme state: defaults to dark mode
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Sync theme to body class list and localStorage
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toast helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getAllTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Ensure Spring Boot is running on http://localhost:8081 or http://localhost:8080.');
      addToast('Backend connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Create or Update task
  const handleSubmitTask = async (taskData) => {
    try {
      const isEdit = !!editingTask;
      let saved;

      if (isEdit) {
        saved = await taskApi.updateTask(editingTask.id, taskData);
        addToast(`Task "${saved.tName}" updated successfully`);
      } else {
        // Notice: we do NOT generate an id client-side because the backend auto-generates it!
        saved = await taskApi.addTask(taskData);
        addToast(`Task "${saved.tName}" created successfully`);
      }

      setEditingTask(null);
      setIsFormOpen(false);
      loadTasks();
    } catch (err) {
      console.error(err);
      addToast('Failed to save task', 'error');
    }
  };

  // Toggle complete state
  const handleToggleComplete = async (task) => {
    try {
      const isCompleted = task.completeStatus || !!task.completedAt;
      let updated;

      if (!isCompleted) {
        updated = await taskApi.completeTask(task.id);
        addToast(`Completed "${updated.tName}"`);
      } else {
        const resetTask = {
          ...task,
          completeStatus: false,
          completedAt: null
        };
        updated = await taskApi.updateTask(task.id, resetTask);
        addToast(`Marked "${updated.tName}" as active`);
      }
      loadTasks();
    } catch (err) {
      console.error(err);
      addToast('Failed to toggle completion status', 'error');
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.deleteTask(id);
      addToast('Task deleted successfully');
      if (editingTask && editingTask.id === id) {
        setEditingTask(null);
      }
      loadTasks();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete task', 'error');
    }
  };

  // Clear all tasks
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) return;
    try {
      await taskApi.deleteAllTasks();
      addToast('All tasks cleared successfully');
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      console.error(err);
      addToast('Failed to clear tasks', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Sorting and Filtering Logic
  const getProcessedTasks = () => {
    return tasks
      .filter((task) => {
        const name = (task.tName || '').toLowerCase();
        const desc = (task.tDescription || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.tName || '').localeCompare(b.tName || '');
        }
        if (sortBy === 'createdAt') {
          const dateA = parseBackendDate(a.createdAt) || new Date(0);
          const dateB = parseBackendDate(b.createdAt) || new Date(0);
          return dateB - dateA; // Newest first
        }
        if (sortBy === 'dueAt') {
          const dateA = parseBackendDate(a.dueAt);
          const dateB = parseBackendDate(b.dueAt);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1; // Nulls last
          if (!dateB) return -1;
          return dateA - dateB; // Soonest first
        }
        return 0;
      });
  };

  const processedTasks = getProcessedTasks();

  // Kanban Columns grouping
  const activeTasks = processedTasks.filter(t => !t.completeStatus && !isOverdue(t.dueAt));
  const overdueTasks = processedTasks.filter(t => !t.completeStatus && isOverdue(t.dueAt));
  const completedTasks = processedTasks.filter(t => t.completeStatus);

  return (
    <div className="app-container">
      {/* Toast Notifier */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Header Nav */}
      <header className="app-header">
        <div className="logo-section">
          <CheckCircle2 className="logo-icon" />
          <h1 className="logo-text">TaskHub</h1>
        </div>
        
        <div className="header-actions">
          {/* Light/Dark Toggle */}
          <button 
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          
          <button className="btn btn-secondary" onClick={loadTasks} title="Refresh Dashboard">
            <RefreshCw size={14} /> Refresh
          </button>
          
          {tasks.length > 0 && (
            <button className="btn btn-danger" onClick={handleClearAll} title="Delete All Tasks">
              <Trash2 size={14} /> Clear All
            </button>
          )}

          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={14} /> New Task
          </button>
        </div>
      </header>

      {/* Controls / Filter / Sorting toolbar */}
      <div className="controls-toolbar">
        <div className="left-controls">
          {/* View Toggles */}
          <div className="toggle-group">
            <button 
              className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
            >
              <LayoutGrid size={13} />
              <span>Board</span>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Compact List View"
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>

          {/* Sort Selector */}
          <select 
            className="sort-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            title="Sort Tasks By"
          >
            <option value="dueAt">Sort by Due Date</option>
            <option value="createdAt">Sort by Date Created</option>
            <option value="name">Sort Alphabetically</option>
          </select>
        </div>

        {/* Search */}
        <div className="right-controls" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            className="form-input"
            style={{ paddingLeft: '2.25rem', width: '220px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search 
            size={13} 
            style={{ position: 'absolute', left: '0.85rem', color: 'var(--color-text-dim)' }} 
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-dim)',
                cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="view-content-area">
        {loading ? (
          <div className="empty-state">
            <Loader2 className="empty-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
            <p className="empty-title">Retrieving Tasks...</p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', gap: '1.25rem', borderColor: 'var(--color-danger)', background: 'var(--color-danger-glow)' }}>
            <AlertCircle size={28} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>Connection Status: Offline</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>{error}</p>
              <button className="btn btn-secondary" style={{ marginTop: '1.25rem', fontSize: '0.8rem' }} onClick={loadTasks}>
                Retry Sync
              </button>
            </div>
          </div>
        ) : processedTasks.length === 0 ? (
          <div className="glass-panel empty-state">
            <CheckCircle2 className="empty-icon" />
            <h3 className="empty-title">All caught up!</h3>
            <p className="empty-subtitle">
              {searchQuery 
                ? 'No tasks match your search filter.'
                : 'Create a new task to organize your day.'}
            </p>
          </div>
        ) : viewMode === 'board' ? (
          /* Kanban Board View */
          <div className="kanban-board">
            
            {/* Active Column */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title active-title">
                  <Clock size={14} />
                  <span>Active</span>
                  <span className="column-badge">{activeTasks.length}</span>
                </div>
              </div>
              <div className="column-cards-container">
                {activeTasks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <p className="empty-subtitle" style={{ fontSize: '0.75rem' }}>No active tasks.</p>
                  </div>
                ) : (
                  activeTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onEdit={openEditModal}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Overdue Column */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title overdue-title">
                  <AlertTriangle size={14} />
                  <span>Overdue</span>
                  <span className="column-badge">{overdueTasks.length}</span>
                </div>
              </div>
              <div className="column-cards-container">
                {overdueTasks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <p className="empty-subtitle" style={{ fontSize: '0.75rem' }}>No overdue tasks.</p>
                  </div>
                ) : (
                  overdueTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onEdit={openEditModal}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title completed-title">
                  <CheckCircle2 size={14} />
                  <span>Completed</span>
                  <span className="column-badge">{completedTasks.length}</span>
                </div>
              </div>
              <div className="column-cards-container">
                {completedTasks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <p className="empty-subtitle" style={{ fontSize: '0.75rem' }}>No completed tasks.</p>
                  </div>
                ) : (
                  completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onEdit={openEditModal}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          /* List View (Table Layout) */
          <div className="list-view-container">
            <table className="list-view-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Status</th>
                  <th>Task Name</th>
                  <th>Description</th>
                  <th style={{ width: '180px' }}>Date Created</th>
                  <th style={{ width: '180px' }}>Due Date</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedTasks.map((task) => {
                  const isCompleted = task.completeStatus || !!task.completedAt;
                  const isTaskOverdue = !isCompleted && isOverdue(task.dueAt);
                  
                  let badgeClass = 'list-badge-active';
                  let badgeText = 'Active';
                  if (isCompleted) {
                    badgeClass = 'list-badge-completed';
                    badgeText = 'Completed';
                  } else if (isTaskOverdue) {
                    badgeClass = 'list-badge-overdue';
                    badgeText = 'Overdue';
                  }

                  return (
                    <tr key={task.id} className="list-row">
                      <td>
                        <span className={`list-badge ${badgeClass}`}>{badgeText}</span>
                      </td>
                      <td style={{ fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--color-text-dim)' : 'inherit' }}>
                        {task.tName}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {task.tDescription || '-'}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                        {task.createdAt}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: isTaskOverdue ? 'var(--color-danger)' : 'var(--color-text-dim)', fontWeight: isTaskOverdue ? '600' : 'normal' }}>
                        {task.dueAt || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button className="action-btn-circle" onClick={() => openEditModal(task)} title="Edit Task">
                            <Pencil size={11} />
                          </button>
                          <button className="action-btn-circle action-complete" onClick={() => handleToggleComplete(task)} title={isCompleted ? "Mark Active" : "Mark Completed"}>
                            {isCompleted ? <RotateCcw size={11} /> : <Check size={11} />}
                          </button>
                          <button className="action-btn-circle action-delete" onClick={() => handleDeleteTask(task.id)} title="Delete Task">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation/Editing Modal Dialog */}
      <TaskForm
        isOpen={isFormOpen}
        onSubmit={handleSubmitTask}
        editingTask={editingTask}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
