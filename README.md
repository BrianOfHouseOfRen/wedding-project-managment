# Wedding Filmmaker Project Manager

A lightweight web application for wedding filmmakers to track and manage their projects from start to finish.

## Features

- **Project Management**: Add and track wedding film projects with couple names and dates
- **Task Tracking**: Monitor progress of standard wedding film tasks:
  - Culling footage
  - Editing speeches
  - Creating feature films
  - Producing short films
- **Visual Progress**: See completion percentage for each project
- **Analytics Dashboard**: View overall project completion statistics
- **Data Persistence**: All data is saved locally in your browser
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Screenshots

The application includes:
- Project management interface with task tracking
- Visual progress indicators
- Analytics dashboard with completion chart

## Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Modern styling with CSS variables and responsive design
- **JavaScript**: Vanilla JS with ES6+ features
- **Chart.js**: For data visualization
- **localStorage API**: For client-side data persistence

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or installation required

### Installation

1. Download the project files:
   - index.html
   - styles.css
   - app.js

2. Open `index.html` in your web browser

That's it! The application runs entirely in your browser.

## Usage

### Adding a New Project

1. Fill in the couple's names in the "Project Name" field
2. Select the wedding date using the date picker
3. Click "Add Project" button
4. The new project will appear in the "Current Projects" section

### Managing Tasks

1. Each project card shows four standard tasks:
   - Cull: Initial footage selection and organization
   - Speeches: Editing and finalizing speech segments
   - Feature Film: Creating the main wedding film
   - Short Film: Creating a condensed highlight film

2. Check off tasks as you complete them:
   - The progress bar will update automatically
   - The completion percentage will increase
   - When all tasks are complete, the project will be marked as completed with a green border

### Using the Analytics Dashboard

1. The doughnut chart at the bottom shows your overall project completion rate
2. This updates automatically as you complete tasks and projects
3. The center of the chart displays the exact completion percentage

### Data Management

- All data is automatically saved to your browser's localStorage
- Data persists between browser sessions
- To clear all data, you would need to clear your browser's localStorage

## Customization

You can customize the application by:
- Modifying the CSS variables in `styles.css` to change colors and styling
- Editing the task types in `app.js` to match your workflow

## Development

### Project Structure

- `index.html`: Main HTML structure and content
- `styles.css`: All styling and responsive design rules
- `app.js`: Application logic and functionality

### Key Components

- **ProjectManager class**: Core functionality for managing projects
- **localStorage integration**: For data persistence
- **Chart.js implementation**: For analytics visualization

## Browser Compatibility

The application is compatible with:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Performance Considerations

- The application is lightweight and runs entirely in the browser
- localStorage has a size limit (typically 5MB per domain)
- For very large numbers of projects, consider implementing data export/import functionality

## Accessibility

- All form elements have proper labels
- Color contrast meets WCAG standards
- Keyboard navigation is supported

## License

This project is available for personal and commercial use.

## Acknowledgments

- Chart.js for the visualization library
- Modern browser APIs that make client-side applications possible