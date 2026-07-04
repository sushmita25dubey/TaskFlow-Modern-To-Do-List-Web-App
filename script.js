

document.addEventListener('DOMContentLoaded', () => {
  
  
  let tasks = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let sortBy = 'date-created'; 
  let editingTaskId = null;

  
  const body = document.body;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');
  
  // Sidebar Elements
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarNavItems = document.querySelectorAll('.nav-item');
  const sidebarCreateBtn = document.getElementById('sidebarCreateBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const helpBtn = document.getElementById('helpBtn');

  // Badge Elements
  const badgeAll = document.getElementById('badgeAll');
  const badgeActive = document.getElementById('badgeActive');
  const badgeCompleted = document.getElementById('badgeCompleted');
  const badgeHigh = document.getElementById('badgeHigh');

  // Stats Value Elements
  const statsTotalVal = document.getElementById('statsTotalVal');
  const statsCompletedVal = document.getElementById('statsCompletedVal');
  const statsPendingVal = document.getElementById('statsPendingVal');
  const statsUrgentVal = document.getElementById('statsUrgentVal');

  // Hero Section
  const heroSubtitle = document.getElementById('heroSubtitle');
  const currentDateText = document.getElementById('currentDateText');

  // Form Elements
  const formPanel = document.getElementById('formPanel');
  const closeFormBtn = document.getElementById('closeFormBtn');
  const taskForm = document.getElementById('taskForm');
  const taskIdInput = document.getElementById('taskIdInput');
  const taskTitleInput = document.getElementById('taskTitle');
  const taskCategorySelect = document.getElementById('taskCategory');
  const taskPrioritySelect = document.getElementById('taskPriority');
  const taskDueDateInput = document.getElementById('taskDueDate');
  const submitTaskBtn = document.getElementById('submitTaskBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const formTitle = document.getElementById('formTitle');
  
  // Validation Feedbacks
  const titleError = document.getElementById('titleError');
  const dateError = document.getElementById('dateError');

  // Task List & Sorting Elements
  const searchInput = document.getElementById('searchInput');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const sortBtn = document.getElementById('sortBtn');
  const sortDropdown = document.getElementById('sortDropdown');
  const sortOptions = document.querySelectorAll('.sort-option');
  const tasksContainer = document.getElementById('tasksContainer');
  const emptyState = document.getElementById('emptyState');
  
  // Mobile FAB
  const mobileFab = document.getElementById('mobileFab');


  function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getTomorrowString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getSpecificDateString(offsetDays) {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function loadSeedData() {
    const today = getTodayString();
    const tomorrow = getTomorrowString();
    
    // Seed tasks
    const seed = [
      {
        id: 'seed-1',
        title: 'Complete quarterly financial report',
        category: 'Work',
        priority: 'High',
        dueDate: today,
        completed: false,
        order: 0,
        createdAt: Date.now() - 1000 * 60 * 60 * 3 // 3 hours ago
      },
      {
        id: 'seed-2',
        title: 'Buy organic fertilizer for garden',
        category: 'Personal',
        priority: 'Medium',
        dueDate: tomorrow,
        completed: false,
        order: 1,
        createdAt: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
      },
      {
        id: 'seed-3',
        title: 'Design system review',
        category: 'Work',
        priority: 'Medium',
        dueDate: today,
        completed: true,
        order: 2,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 days ago
      },
      {
        id: 'seed-4',
        title: 'Weekly grocery shopping list',
        category: 'Shopping',
        priority: 'Low',
        dueDate: getSpecificDateString(2), // 2 days from now
        completed: false,
        order: 3,
        createdAt: Date.now() - 1000 * 60 * 60 * 1 // 1 hour ago
      }
    ];

    // Add 20 more dummy completed tasks so stats (24 total, 18 done, 6 queue) feel real on first load!
    const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];
    const priorities = ['Low', 'Medium', 'High'];
    
    for (let i = 5; i <= 24; i++) {
      const isCompleted = i > 6; // Tasks 7-24 are completed (18 completed)
      seed.push({
        id: `seed-${i}`,
        title: `Archived productivity task reference #${i - 4}`,
        category: categories[i % categories.length],
        priority: priorities[i % priorities.length],
        dueDate: getSpecificDateString(-i % 7), // Past dates
        completed: isCompleted,
        order: i - 1,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * i // Days ago
      });
    }

    return seed;
  }

  // Format date visually for task card matching reference design
  function formatDueDate(dateStr) {
    if (!dateStr) return '';
    const todayStr = getTodayString();
    const tomorrowStr = getTomorrowString();
    
    if (dateStr === todayStr) {
      return 'Today, 5:00 PM'; // Mock typical due time for aesthetic match
    } else if (dateStr === tomorrowStr) {
      return 'Tomorrow';
    } else {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${months[monthIndex]} ${day}`;
      }
      return dateStr;
    }
  }

  
  function initApp() {
    // Load tasks from localStorage or seed them
    const stored = localStorage.getItem('taskflow_tasks');
    if (stored) {
      tasks = JSON.parse(stored);
    } else {
      tasks = loadSeedData();
      saveTasksToStorage();
    }
    
    // Setup default date picker input to tomorrow
    taskDueDateInput.value = getTomorrowString();
    
    // Set dynamic current date in hero
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    currentDateText.textContent = new Date().toLocaleDateString('en-US', options);

    // Apply saved theme preference
    const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
    } else {
      body.classList.remove('dark-mode');
      moonIcon.classList.remove('hidden');
      sunIcon.classList.add('hidden');
    }

    updateStats();
    renderTasks();
  }

  function saveTasksToStorage() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }

  
  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    // Urgent tasks: Not completed and High Priority
    const urgent = tasks.filter(t => !t.completed && t.priority === 'High').length;

    // Update Stats Card Counters
    statsTotalVal.textContent = total;
    statsCompletedVal.textContent = completed;
    statsPendingVal.textContent = pending;
    statsUrgentVal.textContent = urgent;

    // Update Sidebar Navigation Badges
    badgeAll.textContent = total;
    badgeActive.textContent = pending;
    badgeCompleted.textContent = completed;
    badgeHigh.textContent = tasks.filter(t => t.priority === 'High').length;

    // Update Hero Subtitle: Today's pending tasks count
    const todayStr = getTodayString();
    const todayPending = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
    
    if (todayPending === 0) {
      heroSubtitle.textContent = "You have cleared your agenda for today. Keep growing.";
    } else if (todayPending === 1) {
      heroSubtitle.textContent = "You have 1 task to finish today. Keep growing.";
    } else {
      heroSubtitle.textContent = `You have ${todayPending} tasks to finish today. Keep growing.`;
    }
  }

  // --------------------------------------------------------------------------
  // 6. CRUD Operations
  // --------------------------------------------------------------------------
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = taskTitleInput.value.trim();
    const category = taskCategorySelect.value;
    const priority = taskPrioritySelect.value;
    const dueDate = taskDueDateInput.value;

    let isValid = true;
    
    // Basic Form Validation
    if (!title) {
      taskTitleInput.classList.add('invalid');
      titleError.classList.add('active');
      isValid = false;
    } else {
      taskTitleInput.classList.remove('invalid');
      titleError.classList.remove('active');
    }

    if (!dueDate) {
      taskDueDateInput.classList.add('invalid');
      dateError.classList.add('active');
      isValid = false;
    } else {
      taskDueDateInput.classList.remove('invalid');
      dateError.classList.remove('active');
    }

    if (!isValid) return;

    if (editingTaskId) {
      // Edit mode
      const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].title = title;
        tasks[taskIndex].category = category;
        tasks[taskIndex].priority = priority;
        tasks[taskIndex].dueDate = dueDate;
      }
      editingTaskId = null;
      submitBtnText.textContent = 'Create Task';
      formTitle.textContent = 'Add New Task';
      cancelEditBtn.classList.add('hidden');
    } else {
      // Create mode
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        category,
        priority,
        dueDate,
        completed: false,
        order: tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) + 1 : 0,
        createdAt: Date.now()
      };
      tasks.push(newTask);
    }

    saveTasksToStorage();
    updateStats();
    renderTasks();
    
    // Reset Form
    taskForm.reset();
    taskDueDateInput.value = getTomorrowString();
    
    // Close Drawer on mobile/tablet view
    closeFormDrawer();
  }

  function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    taskTitleInput.value = task.title;
    taskCategorySelect.value = task.category;
    taskPrioritySelect.value = task.priority;
    taskDueDateInput.value = task.dueDate;

    submitBtnText.textContent = 'Save Changes';
    formTitle.textContent = 'Edit Task';
    cancelEditBtn.classList.remove('hidden');

    // Open drawer on mobile view
    openFormDrawer();
    
    // Focus title input
    taskTitleInput.focus();
  }

  function deleteTask(id) {
    // Add fade out animation in UI before deletion
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9) translateX(-20px)';
      card.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasksToStorage();
        updateStats();
        renderTasks();
      }, 300);
    } else {
      tasks = tasks.filter(t => t.id !== id);
      saveTasksToStorage();
      updateStats();
      renderTasks();
    }
  }

  function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage();
    updateStats();
    
    // Apply temporary animation class to card before re-render
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      if (task.completed) {
        card.classList.add('completed');
      } else {
        card.classList.remove('completed');
      }
    }
    
    // Delay render slightly for smooth transitions
    setTimeout(() => {
      renderTasks();
    }, 150);
  }

  function cancelEditing() {
    editingTaskId = null;
    taskForm.reset();
    taskDueDateInput.value = getTomorrowString();
    submitBtnText.textContent = 'Create Task';
    formTitle.textContent = 'Add New Task';
    cancelEditBtn.classList.add('hidden');
    closeFormDrawer();
  }

  
  function getFilteredTasks() {
    let result = [...tasks];

    // Filter by status tab selection
    if (currentFilter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      result = result.filter(t => t.completed);
    } else if (currentFilter === 'high-priority') {
      result = result.filter(t => t.priority === 'High');
    }

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q)
      );
    }

    // Sort tasks
    result.sort((a, b) => {
      // Completed items always sorted towards bottom for active filters,
      // but let's keep strict order matching.
      if (sortBy === 'due-date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'priority') {
        const priorities = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorities[b.priority] - priorities[a.priority];
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      } else {
        // Date created / default drag order
        return a.order - b.order;
      }
    });

    return result;
  }

  function renderTasks() {
    const list = getFilteredTasks();
    tasksContainer.innerHTML = '';

    if (list.length === 0) {
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    list.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card prio-${task.priority.toLowerCase()}`;
      if (task.completed) card.classList.add('completed');
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-id', task.id);

      // Icon classes mapping
      const catClass = `cat-${task.category.toLowerCase()}`;
      const prioClass = `prio-badge-${task.priority.toLowerCase()}`;

      // Left Accent Border & Drag Grip Indicator
      card.innerHTML = `
        <div class="task-drag-handle" title="Drag to reorder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>

        <label class="task-checkbox-wrapper">
          <input type="checkbox" ${task.completed ? 'checked' : ''}>
          <span class="checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>

        <div class="task-details">
          <span class="task-title">${escapeHTML(task.title)}</span>
          <div class="task-meta-row">
            <span class="badge ${catClass}">${task.category}</span>
            ${task.completed ? 
              `<span class="badge completed-badge" style="background-color: var(--green-accent-light); color: var(--primary-accent); display: inline-flex; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg> Completed
              </span>` : 
              `<span class="badge ${prioClass}">${task.priority} Priority</span>`
            }
            ${(!task.completed && task.dueDate) ? `
              <span class="task-due-date">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${formatDueDate(task.dueDate)}
              </span>
            ` : ''}
          </div>
        </div>

        <div class="task-actions">
          <button class="action-icon-btn edit-btn" aria-label="Edit task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="action-icon-btn delete-btn" aria-label="Delete task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;

      // Setup task event listeners
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => editTask(task.id));

      const delBtn = card.querySelector('.delete-btn');
      delBtn.addEventListener('click', () => deleteTask(task.id));

      // Drag and Drop Event Attachments
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('dragend', handleDragEnd);
      card.addEventListener('drop', handleDrop);

      tasksContainer.appendChild(card);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // --------------------------------------------------------------------------
  // 8. Drag and Drop Implementation
  // --------------------------------------------------------------------------
  let draggedCard = null;

  function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!draggedCard || draggedCard === this) return;
    
    // Sort logic requires date-created/default list order
    if (sortBy !== 'date-created') return;

    const containerRect = tasksContainer.getBoundingClientRect();
    const cardRect = this.getBoundingClientRect();
    const relativeY = e.clientY - cardRect.top;
    const isAfter = relativeY > (cardRect.height / 2);

    if (isAfter) {
      this.after(draggedCard);
    } else {
      this.before(draggedCard);
    }
  }

  function handleDragEnd() {
    if (draggedCard) {
      draggedCard.classList.remove('dragging');
      draggedCard = null;
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    if (sortBy !== 'date-created') return;

    // Recalculate array orders based on new visual DOM positions
    const visualCards = Array.from(tasksContainer.querySelectorAll('.task-card'));
    const newTasksOrder = [];

    visualCards.forEach((cardEl, idx) => {
      const taskId = cardEl.getAttribute('data-id');
      const originalTask = tasks.find(t => t.id === taskId);
      if (originalTask) {
        originalTask.order = idx;
        newTasksOrder.push(originalTask);
      }
    });

    // Merge in any tasks that are filtered out and weren't displayed
    tasks.forEach(task => {
      if (!newTasksOrder.some(t => t.id === task.id)) {
        newTasksOrder.push(task);
      }
    });

    tasks = newTasksOrder;
    saveTasksToStorage();
    updateStats();
  }

  // --------------------------------------------------------------------------
  // 9. Mobile Drawers & Sidebar Toggles
  // --------------------------------------------------------------------------
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.style.display = 'block';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.style.display = 'none';
  }

  function openFormDrawer() {
    if (window.innerWidth <= 1024) {
      formPanel.classList.add('open');
      sidebarOverlay.style.display = 'block';
    }
  }

  function closeFormDrawer() {
    formPanel.classList.remove('open');
    if (!sidebar.classList.contains('open')) {
      sidebarOverlay.style.display = 'none';
    }
  }

  // --------------------------------------------------------------------------
  // 10. Event Listeners Initialization
  // --------------------------------------------------------------------------

  // Theme Toggler
  themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      moonIcon.classList.remove('hidden');
      sunIcon.classList.add('hidden');
      localStorage.setItem('taskflow_theme', 'light');
    }
  });

  // Mobile Toggles
  hamburgerBtn.addEventListener('click', openSidebar);
  sidebarOverlay.addEventListener('click', () => {
    closeSidebar();
    closeFormDrawer();
  });
  
  mobileFab.addEventListener('click', () => {
    cancelEditing(); // Reset states
    openFormDrawer();
  });

  closeFormBtn.addEventListener('click', closeFormDrawer);
  sidebarCreateBtn.addEventListener('click', () => {
    cancelEditing();
    closeSidebar();
    openFormDrawer();
  });

  // Filter Tabs Event Listeners (Lower Area Tab controls)
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      e.target.classList.add('active');
      e.target.setAttribute('aria-selected', 'true');
      
      currentFilter = e.target.getAttribute('data-filter');
      
      // Keep Sidebar navigation items in sync
      sidebarNavItems.forEach(item => {
        if (item.getAttribute('data-filter') === currentFilter) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      renderTasks();
    });
  });

  // Sidebar Filter Event Listeners
  sidebarNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      sidebarNavItems.forEach(i => i.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = btn.getAttribute('data-filter');

      // Keep Lower tabs in sync
      filterTabs.forEach(tab => {
        if (tab.getAttribute('data-filter') === currentFilter) {
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
        } else {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
        }
      });

      closeSidebar();
      renderTasks();
    });
  });

  // Search Engine
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
  });

  // Sort Dropdown Trigger
  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    sortDropdown.classList.add('hidden');
  });

  sortOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      sortOptions.forEach(o => o.classList.remove('active'));
      e.target.classList.add('active');
      
      sortBy = e.target.getAttribute('data-sort');
      sortDropdown.classList.add('hidden');
      renderTasks();
    });
  });

  // Form Controls
  taskForm.addEventListener('submit', handleFormSubmit);
  cancelEditBtn.addEventListener('click', cancelEditing);

  // Settings & Help Buttons Alerts
  settingsBtn.addEventListener('click', () => {
    alert('TaskFlow Workspace Settings: Options configured in active browser cache.');
  });

  helpBtn.addEventListener('click', () => {
    alert('TaskFlow Help Center:\n\n1. Double-click or hover a task card to find edit/delete controls.\n2. Drag & Drop cards vertically to customize task order.\n3. Add new tasks using the side panel forms or Mobile FAB.');
  });

  // Keyboard accessibility helper for Enter key on list items
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editingTaskId) cancelEditing();
      closeFormDrawer();
      closeSidebar();
    }
  });

  // Run App
  initApp();
});
