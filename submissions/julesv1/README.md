# JulesV1 Game Engine

A modular, component-based game engine built with Babylon.js.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm

## How to Run Locally

1. **Navigate to the project directory:**
   ```bash
   cd submissions/julesv1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Open the URL shown in the terminal (usually `http://localhost:5173`).

## Project Structure

- `src/core`: Core engine logic (Entity, Component, System, Engine).
- `src/systems`: System implementations (Physics, Render, Region, Logic).
- `src/components`: Component definitions.
- `src/editor`: Runtime editor (Gizmos, Inspector).

## Controls

- **Left Click**: Select objects.
- **Drag Gizmos**: Move selected objects.
- **Inspector**: Edit properties and attach scripts.
