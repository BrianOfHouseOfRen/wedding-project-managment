/**
 * Wedding Filmmaker Project Manager
 * Core JavaScript functionality for managing wedding film projects
 * 
 * This application allows wedding filmmakers to:
 * - Track multiple wedding film projects
 * - Monitor task completion status
 * - Visualize overall project completion
 * - Store data locally in the browser
 * 
 * @version 1.0.0
 * @author Wedding Filmmaker App Team
 */

// Data Management
class ProjectManager {
    /**
     * Initialize the project manager
     * Sets up data structures, loads saved projects, and initializes UI
     */
    constructor() {
        this.projects = [];
        this.chart = null;
        this.eventListeners = []; // Track event listeners for cleanup
        this.loadProjects();
        this.setupEventListeners();
        this.initializeChart();
    }

    /**
     * Load projects from localStorage or initialize with empty array
     * Handles potential errors with localStorage access
     */
    loadProjects() {
        try {
            const savedProjects = localStorage.getItem('weddingProjects');
            if (savedProjects) {
                this.projects = JSON.parse(savedProjects);
                console.info(`Loaded ${this.projects.length} projects from localStorage`);
            }
        } catch (error) {
            console.error('Error loading projects from localStorage:', error);
            this.projects = [];
            // Show error notification to user
            this.showNotification('Error loading saved projects. Starting with empty project list.', 'error');
        }
        this.renderProjects();
    }

    /**
     * Save projects to localStorage
     * Includes error handling for quota exceeded or other storage issues
     */
    saveProjects() {
        try {
            localStorage.setItem('weddingProjects', JSON.stringify(this.projects));
        } catch (error) {
            console.error('Error saving projects to localStorage:', error);
            
            // Handle specific error types
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Storage limit exceeded. Try removing old projects.', 'error');
            } else {
                this.showNotification('Failed to save your projects. Please check your browser settings.', 'error');
            }
        }
    }

    /**
     * Display a notification message to the user
     * @param {string} message - The message to display
     * @param {string} type - The type of notification ('info', 'success', 'error')
     */
    showNotification(message, type = 'info') {
        // For now, just use alert, but this could be enhanced with a custom notification system
        alert(message);
    }

    /**
     * Add a new project to the collection
     * @param {Object} projectData - The project data from the form
     */
    addProject(projectData) {
        // Input validation
        if (!projectData.name || !projectData.date) {
            this.showNotification('Project name and date are required', 'error');
            return;
        }
        
        const newProject = {
            id: Date.now().toString(), // Unique ID based on timestamp
            name: this.sanitizeInput(projectData.name),
            date: projectData.date,
            dateFormatted: this.formatDate(projectData.date),
            tasks: {
                cull: false,
                speeches: false,
                featureFilm: false,
                shortFilm: false
            },
            completed: false,
            progress: 0,
            createdAt: new Date().toISOString()
        };

        this.projects.push(newProject);
        this.saveProjects();
        this.renderProjects();
        this.updateChart();
        
        // Show success notification
        this.showNotification(`Project "${newProject.name}" added successfully`, 'success');
    }

    /**
     * Sanitize user input to prevent XSS attacks
     * @param {string} input - The user input to sanitize
     * @returns {string} Sanitized input string
     */
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Format date to be more readable
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    formatDate(dateString) {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString; // Return original string if formatting fails
        }
    }

    /**
     * Update a task status for a project
     * @param {string} projectId - The project ID
     * @param {string} taskName - The task name
     * @param {boolean} isCompleted - Whether the task is completed
     */
    updateTask(projectId, taskName, isCompleted) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.tasks[taskName] = isCompleted;
            
            // Calculate progress
            const taskCount = Object.keys(project.tasks).length;
            const completedTasks = Object.values(project.tasks).filter(Boolean).length;
            project.progress = Math.round((completedTasks / taskCount) * 100);
            
            // Check if all tasks are completed
            project.completed = completedTasks === taskCount;
            
            // Update last modified timestamp
            project.lastModified = new Date().toISOString();
            
            this.saveProjects();
            this.updateProjectUI(project);
            this.updateChart();
            
            // Show notification if project is completed
            if (project.completed) {
                this.showNotification(`Project "${project.name}" is now complete!`, 'success');
            }
        } else {
            console.error(`Project with ID ${projectId} not found`);
        }
    }

    /**
     * Update the UI for a specific project
     * @param {Object} project - The project to update in the UI
     */
    updateProjectUI(project) {
        const projectCard = document.getElementById(`project-${project.id}`);
        if (!projectCard) {
            console.warn(`Project card for ID ${project.id} not found in DOM`);
            return;
        }

        // Update progress bar
        const progressFill = projectCard.querySelector('.progress-fill');
        const progressText = projectCard.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${project.progress}%`;
            progressText.textContent = `${project.progress}% Complete`;
        }
        
        // Update completed status
        if (project.completed) {
            projectCard.classList.add('completed');
        } else {
            projectCard.classList.remove('completed');
        }
        
        // Update task checkboxes to match data
        Object.entries(project.tasks).forEach(([taskName, isCompleted]) => {
            const checkbox = projectCard.querySelector(`#${taskName}-${project.id}`);
            if (checkbox) {
                checkbox.checked = isCompleted;
            }
        });
    }

    /**
     * Render all projects to the UI
     * Creates project cards and handles empty state
     */
    renderProjects() {
        const container = document.getElementById('projects-container');
        if (!container) {
            console.error('Projects container not found in DOM');
            return;
        }
        
        // Clear existing projects
        container.innerHTML = '';
        
        if (this.projects.length === 0) {
            container.innerHTML = '<p class="no-projects">No projects yet. Add your first wedding project above!</p>';
            return;
        }
        
        // Sort projects by date (most recent first)
        const sortedProjects = [...this.projects].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Create project cards
        sortedProjects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            container.appendChild(projectCard);
        });
    }

    /**
     * Create a project card element
     * @param {Object} project - The project data
     * @returns {HTMLElement} The project card element
     */
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = `project-card ${project.completed ? 'completed' : ''}`;
        card.id = `project-${project.id}`;
        
        const taskCount = Object.keys(project.tasks).length;
        const completedTasks = Object.values(project.tasks).filter(Boolean).length;
        const progress = Math.round((completedTasks / taskCount) * 100);
        
        card.innerHTML = `
            <div class="project-header">
                <h3 class="project-title">${project.name}</h3>
                <p class="project-date">${project.dateFormatted}</p>
            </div>
            <div class="project-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
                <span class="progress-text">${progress}% Complete</span>
            </div>
            <div class="project-tasks">
                <div class="task-item">
                    <input type="checkbox" id="cull-${project.id}" class="task-checkbox" 
                           data-project="${project.id}" data-task="cull" ${project.tasks.cull ? 'checked' : ''}>
                    <label for="cull-${project.id}">Cull</label>
                </div>
                <div class="task-item">
                    <input type="checkbox" id="speeches-${project.id}" class="task-checkbox" 
                           data-project="${project.id}" data-task="speeches" ${project.tasks.speeches ? 'checked' : ''}>
                    <label for="speeches-${project.id}">Speeches</label>
                </div>
                <div class="task-item">
                    <input type="checkbox" id="featureFilm-${project.id}" class="task-checkbox" 
                           data-project="${project.id}" data-task="featureFilm" ${project.tasks.featureFilm ? 'checked' : ''}>
                    <label for="featureFilm-${project.id}">Feature Film</label>
                </div>
                <div class="task-item">
                    <input type="checkbox" id="shortFilm-${project.id}" class="task-checkbox" 
                           data-project="${project.id}" data-task="shortFilm" ${project.tasks.shortFilm ? 'checked' : ''}>
                    <label for="shortFilm-${project.id}">Short Film</label>
                </div>
            </div>
        `;
        
        return card;
    }

    /**
     * Set up event listeners for the application
     * Uses event delegation where possible for better performance
     */
    setupEventListeners() {
        // Form submission for adding new projects
        const addProjectForm = document.getElementById('add-project-form');
        if (addProjectForm) {
            const formSubmitHandler = (e) => {
                e.preventDefault();
                
                // Form validation
                const projectName = document.getElementById('project-name').value.trim();
                const projectDate = document.getElementById('project-date').value;
                
                if (!projectName) {
                    this.showNotification('Please enter a project name', 'error');
                    return;
                }
                
                if (!projectDate) {
                    this.showNotification('Please select a wedding date', 'error');
                    return;
                }
                
                this.addProject({
                    name: projectName,
                    date: projectDate
                });
                
                // Reset form
                addProjectForm.reset();
            };
            
            addProjectForm.addEventListener('submit', formSubmitHandler);
            this.eventListeners.push({
                element: addProjectForm,
                type: 'submit',
                handler: formSubmitHandler
            });
        }
        
        // Event delegation for task checkboxes
        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer) {
            const checkboxChangeHandler = (e) => {
                if (e.target.classList.contains('task-checkbox')) {
                    const projectId = e.target.dataset.project;
                    const taskName = e.target.dataset.task;
                    const isCompleted = e.target.checked;
                    
                    this.updateTask(projectId, taskName, isCompleted);
                }
            };
            
            projectsContainer.addEventListener('change', checkboxChangeHandler);
            this.eventListeners.push({
                element: projectsContainer,
                type: 'change',
                handler: checkboxChangeHandler
            });
        }
        
        // Add window beforeunload event to warn about unsaved changes
        const beforeUnloadHandler = (e) => {
            // Check if there are any unsaved changes
            // For now, we're not implementing this check since all changes are saved immediately
            // But this could be enhanced in the future
        };
        
        window.addEventListener('beforeunload', beforeUnloadHandler);
        this.eventListeners.push({
            element: window,
            type: 'beforeunload',
            handler: beforeUnloadHandler
        });
    }

    /**
     * Clean up event listeners to prevent memory leaks
     * Should be called when the application is destroyed
     */
    cleanupEventListeners() {
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];
    }

    /**
     * Initialize the completion chart
     * Creates a doughnut chart showing overall project completion
     */
    initializeChart() {
        const chartCanvas = document.getElementById('completion-chart');
        if (!chartCanvas) {
            console.error('Chart canvas not found in DOM');
            return;
        }

        try {
            // Calculate completion percentage
            const completionData = this.calculateCompletionData();
            
            // Get colors from CSS variables for consistent styling
            const successColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--success-color').trim() || '#4caf50';
            const secondaryColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--secondary-color').trim() || '#e0e0e0';
            
            // Chart configuration
            this.chart = new Chart(chartCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress'],
                    datasets: [{
                        data: [completionData.completedPercentage, 100 - completionData.completedPercentage],
                        backgroundColor: [successColor, secondaryColor],
                        borderColor: [successColor, secondaryColor],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1000,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.raw}%`;
                                }
                            }
                        }
                    }
                },
                plugins: [{
                    id: 'centerText',
                    beforeDraw: function(chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        
                        ctx.restore();
                        
                        // Font settings for percentage
                        const fontSize = (height / 8).toFixed(2);
                        ctx.font = `bold ${fontSize}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        
                        // Get completion percentage
                        const percentage = chart.data.datasets[0].data[0];
                        const text = `${percentage}%`;
                        
                        // Draw percentage
                        ctx.fillStyle = getComputedStyle(document.documentElement)
                            .getPropertyValue('--text-color').trim() || '#333333';
                        ctx.fillText(text, width / 2, height / 2);
                        
                        // Font settings for "Complete" text
                        const smallerFontSize = (height / 16).toFixed(2);
                        ctx.font = `${smallerFontSize}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
                        
                        // Draw "Complete" text
                        ctx.fillStyle = '#777';
                        ctx.fillText('Complete', width / 2, height / 2 + parseInt(fontSize));
                        
                        ctx.save();
                    }
                }]
            });
        } catch (error) {
            console.error('Error initializing chart:', error);
            this.showNotification('Failed to initialize analytics chart', 'error');
        }
    }

    /**
     * Calculate completion data for the chart
     * @returns {Object} Object containing completion statistics
     */
    calculateCompletionData() {
        if (this.projects.length === 0) {
            return {
                totalProjects: 0,
                completedProjects: 0,
                completedPercentage: 0
            };
        }
        
        const totalProjects = this.projects.length;
        const completedProjects = this.projects.filter(project => project.completed).length;
        const completedPercentage = Math.round((completedProjects / totalProjects) * 100);
        
        return {
            totalProjects,
            completedProjects,
            completedPercentage
        };
    }

    /**
     * Update the chart with current completion data
     */
    updateChart() {
        if (!this.chart) {
            console.warn('Chart not initialized, cannot update');
            return;
        }
        
        try {
            const completionData = this.calculateCompletionData();
            
            // Update chart data
            this.chart.data.datasets[0].data = [
                completionData.completedPercentage,
                100 - completionData.completedPercentage
            ];
            
            // Update chart
            this.chart.update();
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const projectManager = new ProjectManager();
        
        // Make projectManager available globally for debugging
        window.projectManager = projectManager;
        
        console.info('Wedding Filmmaker Project Manager initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Failed to initialize the application. Please refresh the page and try again.');
    }
});