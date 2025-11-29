# Flask To‑Do List App

A simple full‑stack to‑do list application built with:

- Backend: Flask (Python) and SQLite
- Frontend: HTML, CSS, and vanilla JavaScript (Fetch API)
- Database: SQLite (file `todo.db` created automatically)

The UI is a dark card layout with a task list, editable items, checkboxes to mark tasks as completed, and counters for completed vs uncompleted tasks.

---

## Features

- Add new tasks
- Mark tasks as completed / uncompleted
- Edit task titles
- Delete tasks
- Persistent storage using SQLite
- JSON API under `/api/todos`
- Responsive dark themed UI

---

## Project structure

flask_todo/
  app.py
  schema.sql
  requirements.txt
  README.md
  .gitignore
  todo.db # created on first run
  static/
    style.css
    app.js
  templates/
    index.html


## Installation

1. **Clone this repository**

git clone <your-repo-url> flask_todo
cd flask_todo

2. **Create and activate a virtual environment (recommended)**

python -m venv venv

**Windows**
venv\Scripts\activate

**macOS / Linux**
source venv/bin/activate


3. **Install dependencies**

pip install -r requirements.txt

This installs Flask and its required packages.[web:40][web:39]

4. **Run the application**

python app.py