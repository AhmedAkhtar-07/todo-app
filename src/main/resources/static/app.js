// This file talks to the Spring Boot backend via fetch() API calls
// ================================================================

// ── Configuration ────
// The base URL of our Spring Boot backend API
const API_URL = '/api/todos';

// ── App State ───
// These variables track the current state of the UI
let allTasks    = [];           // All tasks loaded from the backend
let currentFilter = 'all';     // Which filter is active: all/pending/completed
let editingId   = null;         // ID of the task currently being edited

// ── On Page Load ───
// When the HTML page finishes loading, fetch all tasks from the backend
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();

    // Allow pressing Enter in the input to add a task
    document.getElementById('task-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });
});

// ================================================================
// DATA FUNCTIONS — Talk to the Spring Boot backend
// ================================================================

/**
 * loadTasks()
 * Fetches ALL todos from GET /api/todos and renders them.
 */
async function loadTasks() {
    try {
        const response = await fetch(API_URL);  // GET request to backend

        // Check if the request was successful (status 200–299)
        if (!response.ok) throw new Error('Failed to load tasks');

        allTasks = await response.json();  // Parse the JSON response into an array
        renderTasks();                     // Display the tasks in the DOM
    } catch (error) {
        console.error('Error loading tasks:', error);
        showEmptyState('⚠️ Could not connect to server. Is the backend running?');
    }
}

/**
 * addTask()
 * Reads the input field and sends a POST request to create a new todo.
 */
async function addTask() {
    const input = document.getElementById('task-input');
    const priority = document.getElementById('priority-select').value;

    // Trim whitespace and validate
    const title = input.value.trim();
    if (!title) {
        input.focus();
        return;  // Don't add empty tasks
    }

    // Build the task object to send to the backend
    const newTask = { title, priority, completed: false };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',                               // POST = create
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)                 // Convert JS object → JSON string
        });

        if (!response.ok) throw new Error('Failed to add task');

        const savedTask = await response.json();  // Backend returns the saved task with its ID
        allTasks.push(savedTask);                 // Add to our local array
        renderTasks();                            // Re-render the list

        input.value = '';     // Clear the input
        input.focus();        // Keep focus for quick task adding

    } catch (error) {
        console.error('Error adding task:', error);
        alert('Could not add task. Please try again.');
    }
}

/**
 * toggleTask(id)
 * Sends a PATCH request to flip a task's completed status.
 * Called when the user clicks the circular checkbox.
 */
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH'   // PATCH = partial update
        });

        if (!response.ok) throw new Error('Failed to toggle task');

        const updatedTask = await response.json();

        // Update the task in our local array (find and replace)
        const index = allTasks.findIndex(t => t.id === id);
        if (index !== -1) allTasks[index] = updatedTask;

        renderTasks();  // Re-render to show the change

    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

/**
 * deleteTask(id)
 * Sends a DELETE request to remove a task permanently.
 */
async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;  // Ask user to confirm

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        // Remove from local array
        allTasks = allTasks.filter(t => t.id !== id);
        renderTasks();

    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// ================================================================
// EDIT MODAL FUNCTIONS
// ================================================================

/**
 * openEditModal(id)
 * Opens the edit popup and fills it with the task's current data.
 */
function openEditModal(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    editingId = id;  // Remember which task we're editing

    // Fill the modal inputs with current values
    document.getElementById('edit-input').value    = task.title;
    document.getElementById('edit-priority').value = task.priority;

    // Show the modal
    document.getElementById('edit-modal').style.display = 'flex';
    document.getElementById('edit-input').focus();
}

/**
 * closeModal()
 * Hides the edit modal without saving.
 */
function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingId = null;
}

/**
 * saveEdit()
 * Sends a PUT request to update the task with the new title/priority.
 */
async function saveEdit() {
    if (!editingId) return;

    const title    = document.getElementById('edit-input').value.trim();
    const priority = document.getElementById('edit-priority').value;

    if (!title) return;  // Don't save empty title

    // Find the current task to keep its 'completed' status unchanged
    const currentTask = allTasks.find(t => t.id === editingId);

    const updatedTask = {
        title,
        priority,
        completed: currentTask.completed  // Keep existing completed status
    };

    try {
        const response = await fetch(`${API_URL}/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) throw new Error('Failed to update task');

        const saved = await response.json();

        // Update local array
        const index = allTasks.findIndex(t => t.id === editingId);
        if (index !== -1) allTasks[index] = saved;

        closeModal();
        renderTasks();

    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// Close modal if user clicks the dark overlay background
document.addEventListener('click', (e) => {
    if (e.target.id === 'edit-modal') closeModal();
});

// ================================================================
// FILTER FUNCTION
// ================================================================

/**
 * filterTasks(filter, buttonEl)
 * Changes which tasks are shown: all / pending / completed
 */
function filterTasks(filter, buttonEl) {
    currentFilter = filter;

    // Update active button styling
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    buttonEl.classList.add('active');

    renderTasks();  // Re-render with new filter applied
}

// ================================================================
// RENDER FUNCTIONS — Build and insert HTML from data
// ================================================================

/**
 * renderTasks()
 * Takes allTasks, applies the filter, then renders each task as HTML.
 * This is the main "draw" function — called after every data change.
 */
function renderTasks() {
    const container = document.getElementById('task-list');

    // Apply filter to get only the tasks we want to show
    let tasksToShow = allTasks;
    if (currentFilter === 'pending')   tasksToShow = allTasks.filter(t => !t.completed);
    if (currentFilter === 'completed') tasksToShow = allTasks.filter(t => t.completed);

    // Update the stats bar at the top
    updateStats();

    // Handle empty states
    if (tasksToShow.length === 0) {
        const messages = {
            all:       '<span class="empty-icon">📋</span>No tasks yet! Add one above.',
            pending:   '<span class="empty-icon">✅</span>No pending tasks!',
            completed: '<span class="empty-icon">🎯</span>No completed tasks yet.'
        };
        showEmptyState(messages[currentFilter]);
        return;
    }

    // Build HTML for all tasks and insert them into the page
    container.innerHTML = tasksToShow.map(task => buildTaskHTML(task)).join('');
}

/**
 * buildTaskHTML(task)
 * Creates the HTML string for a single task card.
 * This is a "template" function — returns HTML as a string.
 */
function buildTaskHTML(task) {
    const checkboxClass = task.completed ? 'task-checkbox checked' : 'task-checkbox';
    const cardClass     = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    const badgeClass    = `priority-badge badge-${task.priority}`;
    const badgeLabel    = task.priority.charAt(0) + task.priority.slice(1).toLowerCase();  // "HIGH" → "High"

    // Use template literals to build the HTML
    return `
        <div class="${cardClass}">
            <!-- Checkbox circle — clicking toggles completion -->
            <div class="${checkboxClass}" onclick="toggleTask(${task.id})"></div>

            <!-- Task title text -->
            <span class="task-text">${escapeHTML(task.title)}</span>

            <!-- Priority badge pill -->
            <span class="${badgeClass}">${badgeLabel}</span>

            <!-- Edit and Delete buttons (appear on hover) -->
            <div class="task-actions">
                <button class="action-btn" onclick="openEditModal(${task.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `;
}

/**
 * updateStats()
 * Updates the stats bar: "5 total · 3 done · 2 pending"
 */
function updateStats() {
    const total   = allTasks.length;
    const done    = allTasks.filter(t => t.completed).length;
    const pending = total - done;

    document.getElementById('total-count').textContent   = `${total} total`;
    document.getElementById('done-count').textContent    = `${done} done`;
    document.getElementById('pending-count').textContent = `${pending} pending`;
}

/**
 * showEmptyState(message)
 * Shows a centered message when there are no tasks to display.
 */
function showEmptyState(message) {
    document.getElementById('task-list').innerHTML =
        `<div class="empty-state"><p>${message}</p></div>`;
}

/**
 * escapeHTML(str)
 * Security helper: prevents XSS attacks by escaping special HTML characters.
 * Always sanitize user input before putting it in the DOM!
 */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}