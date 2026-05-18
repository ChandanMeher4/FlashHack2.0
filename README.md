# CampusFlow System: Concurrency & Curriculum Mapper

CampusFlow is a full-stack project designed to demonstrate two major software engineering concepts: **Graph-based Curriculum Mapping** and **Backend Concurrency Control (Race Conditions vs. Mutex Locks)**.

The project is split into a Java Spring Boot backend and a React/Vite frontend featuring a spectacular skeuomorphic hardware interface.

---

## 🏗️ Project Architecture

### 1. Spring Boot Backend (`/backend`)
The backend is a high-performance REST API built with **Java 21** and **Spring Boot 3**.
- **Curriculum Engine (`/api/curriculum`)**: Handles topological sorting of computer science courses based on prerequisite dependency chains to generate a valid semester-by-semester plan.
- **Registration Engine (`/api/registration`)**: Simulates a high-demand course registration system with a strict 30-seat capacity. It exposes two endpoints to handle concurrent traffic:
  - `POST /unsafe/{courseId}`: A naive implementation that suffers from a Time-of-Check to Time-of-Use (TOCTOU) race condition. When bombarded by concurrent requests, it allows overselling seats and data corruption.
  - `POST /safe/{courseId}`: A thread-safe implementation using Java `ReentrantLock` (or synchronized blocks) to serialize access, completely eliminating race conditions and ensuring the strict capacity limit is maintained.

### 2. React Frontend (`/campus-frontend`)
A modern, highly interactive web application built with **React 18**, **Vite**, and **Tailwind CSS v4**.
- **Curriculum Mapper**: A full-screen interactive directed graph powered by `React Flow`. It fetches the topologically sorted curriculum and renders the dependency tree with semantic, semester-based color coding and smooth animations.
- **Live Hardware Server Console**: A spectacular, skeuomorphic modal overlay resembling a physical hardware terminal. It features interactive tactile push-buttons, metallic casing, and a glass CRT monitor output. This console visually runs a simulation identical to the Python attack script, tracking 50 simulated concurrent students attempting to register, and vividly logs the resulting race conditions and lock behaviors in real-time.

### 3. Concurrency Attack Script (`demo_attack.py`)
A multithreaded Python script that allows you to test the backend API race conditions directly from the terminal. It spawns 50 concurrent threads targeting a 10-seat course, proving the data corruption on the `/unsafe` endpoint and the perfect execution of the `/safe` endpoint.

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** and Maven
- **Node.js** (v18+ recommended)
- **Python 3.8+** (with `requests` library)

### 1. Start the Backend
Navigate to the `backend` directory and run the Spring Boot application:
```bash
cd backend
./mvnw spring-boot:run
```
*The API will start on `http://localhost:8080`.*

### 2. Start the Frontend
In a new terminal, navigate to the `campus-frontend` directory, install dependencies, and start Vite:
```bash
cd campus-frontend
npm install
npm run dev
```
*The web app will be available at `http://localhost:5173/`.*

### 3. Run the CLI Attack Simulation (Optional)
If you want to observe the race condition from the terminal without using the web UI, run the python script:
```bash
pip install requests
python demo_attack.py
```
This will output a detailed analysis of successful registrations, rejected attempts, and oversold seats.

---

## 🎨 UI Highlights
- **Skeuomorphism**: The Live Registration console uses deep inset box-shadows, linear gradients, and custom retro scrollbars to perfectly mimic physical server hardware.
- **Glassmorphism**: Curriculum nodes blur the background radially, providing a premium dark-mode aesthetic.
- **Dynamic CSS Variables**: Tailwind v4 is customized extensively via `@theme` to support strict color palettes for academic semesters.
