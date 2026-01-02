# rGameEngine
A free web-based game engine with a project management hub.

## Features

- **Project Hub**: Central hub for managing multiple game projects
- **Easy Project Submission**: Simply add folders to the `submissions/` directory
- **Automatic Discovery**: Projects are automatically detected and displayed
- **Project Descriptions**: Add a `description.txt` file to provide information about your project
- **Direct Access**: Click on any project to view and interact with it

## Getting Started

### Running the Hub

1. Start a PHP development server:
   ```bash
   php -S localhost:8000
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Adding a New Project

1. Create a new folder in the `submissions/` directory:
   ```bash
   mkdir submissions/my-awesome-game
   ```

2. Add your project files (HTML, JavaScript, CSS, etc.)

3. (Optional) Add a `description.txt` file to describe your project:
   ```bash
   echo "My awesome platformer game!" > submissions/my-awesome-game/description.txt
   ```

4. (Optional) Add an `index.html` or `index.php` file as the entry point for your project

5. Refresh the hub page to see your new project listed!

## Project Structure

```
rGameEngine/
├── index.php              # Main hub page
├── submissions/           # Directory for project submissions
│   ├── sample-project-1/
│   │   ├── index.html
│   │   └── description.txt
│   └── sample-project-2/
│       ├── index.html
│       └── description.txt
└── README.md
```

## Requirements

- PHP 7.0 or higher
- Web browser
