let cachedApiBaseUrl = null;

/**
 * Dynamically check if the Spring Boot backend is running on port 8080 or 8081,
 * ensuring we don't accidentally connect to EnterpriseDB's web server on port 8080.
 */
async function getActiveBaseUrl() {
  if (cachedApiBaseUrl) return cachedApiBaseUrl;

  const ports = ['8080', '8081'];
  for (const port of ports) {
    try {
      const url = `http://localhost:${port}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`${url}/`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      // The backend returns a JSON array on / representing tasks.
      // EDB returns HTML "Server is up and running."
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        cachedApiBaseUrl = url;
        console.log(`Connected to active backend on: ${url}`);
        return url;
      }
    } catch (e) {
      // Port is closed or connection failed; ignore and try next
    }
  }

  // Fallback to 8080 if detection fails (which will show standard connection error page)
  return 'http://localhost:8080';
}

/**
 * Format a JavaScript Date object (or datetime string) to "dd-MM-yyyy hh:mm a"
 * strictly using lowercase 'am' / 'pm' as required by the backend parser.
 */
export function formatDateToBackend(dateObj) {
  if (!dateObj) return null;
  const date = new Date(dateObj);
  if (isNaN(date.getTime())) return null;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');

  return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
}

/**
 * Parse a backend date string ("dd-MM-yyyy hh:mm a") into a JS Date object
 */
export function parseBackendDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\s+(am|pm)$/i);
  if (!match) return new Date(dateStr); // Fallback

  const [_, day, month, year, hours, minutes, ampm] = match;
  let hr = parseInt(hours, 10);
  if (ampm.toLowerCase() === 'pm' && hr < 12) hr += 12;
  if (ampm.toLowerCase() === 'am' && hr === 12) hr = 0;

  return new Date(year, month - 1, day, hr, minutes);
}

/**
 * Check if a task's due date has passed
 */
export function isOverdue(dueAtStr) {
  if (!dueAtStr) return false;
  const due = parseBackendDate(dueAtStr);
  if (!due) return false;
  return due < new Date();
}

/**
 * Get the ISO string from backend format for loading into datetime-local inputs
 */
export function backendDateToIso(dateStr) {
  const date = parseBackendDate(dateStr);
  if (!date) return '';
  const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
  return localISOTime;
}

export const taskApi = {
  /**
   * Fetch all tasks: GET /
   */
  async getAllTasks() {
    const baseUrl = await getActiveBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      return response.json();
    } catch (err) {
      cachedApiBaseUrl = null; // reset cache on network failure
      throw err;
    }
  },

  /**
   * Add a new task: POST /
   */
  async addTask(taskData) {
    const baseUrl = await getActiveBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add task: ${response.statusText}`);
      }
      return response.json();
    } catch (err) {
      cachedApiBaseUrl = null;
      throw err;
    }
  },

  /**
   * Update an existing task: PUT /{id}
   */
  async updateTask(id, taskData) {
    const baseUrl = await getActiveBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
      return response.json();
    } catch (err) {
      cachedApiBaseUrl = null;
      throw err;
    }
  },

  /**
   * Complete a task: PUT /{id}/status
   */
  async completeTask(id) {
    const baseUrl = await getActiveBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/${id}/status`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to update task status: ${response.statusText}`);
      }
      return response.json();
    } catch (err) {
      cachedApiBaseUrl = null;
      throw err;
    }
  },

  /**
   * Delete a task: DELETE /{id}
   */
  async deleteTask(id) {
    const baseUrl = await getActiveBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      cachedApiBaseUrl = null;
      throw err;
    }
  },

  /**
   * Delete all tasks: DELETE /
   */
  async deleteAllTasks() {
    const baseUrl = await getActiveBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete all tasks: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      cachedApiBaseUrl = null;
      throw err;
    }
  }
};
