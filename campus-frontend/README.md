# CampusFlow System

CampusFlow is an interactive administrative dashboard and curriculum mapping tool built with React and Vite. It features a spectacular full-screen curriculum dependency graph and a high-fidelity, skeuomorphic hardware terminal that simulates concurrent course registration scenarios.

## Features

### 🗺️ Curriculum Mapper
- **Interactive Dependency Graph**: Visualizes the entire computer science curriculum using a directed graph.
- **Auto-Layout**: Automatically groups courses by semester and draws animated prerequisite dependencies.
- **Modern UI**: Custom-styled node components featuring semantic semester-based color coding and glassmorphism hover effects.

### 🎛️ Hardware Server Console (Live Registration)
A spectacular skeuomorphic overlay mimicking a physical hardware console that simulates concurrent course registration. It demonstrates the critical importance of concurrency locks in backend systems.

- **Unsafe Registration (Race Condition)**: Simulates 50 concurrent students trying to register for 30 seats without a mutex lock. Demonstrates classic TOCTOU (Time-of-Check to Time-of-Use) race conditions, resulting in oversold seats.
- **Safe Registration (Mutex Lock)**: Simulates the same scenario using a sequential mutex lock, correctly enforcing the 30-seat capacity constraint and safely rejecting the excess students.
- **Skeuomorphic Aesthetics**: Features deep metallic bevels, tactile physical buttons with depression animations, hardware LEDs, and a realistic glass CRT terminal output with scanlines and glare effects.
- **Auto-scrolling CRT Log**: Real-time color-coded process output logging each thread's actions, with custom retro scrollbar and smart auto-scroll pausing.

## Technology Stack
- **Frontend Framework**: React 18, Vite
- **Styling**: Tailwind CSS v4 (with custom CSS variable theming and animations)
- **Data Visualization**: React Flow (`@xyflow/react`)
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate into the frontend directory:
   ```bash
   cd campus-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`.

### API Integration
By default, the Curriculum Mapper expects a JSON array of course data at `http://localhost:8080/api/curriculum/sorted`. If the backend is unreachable, it will gracefully degrade and render an extensive fallback dataset of computer science courses.
