from flask import Flask, jsonify, request, render_template, g
import sqlite3
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "todo.db")

app = Flask(__name__)


# ---------- Database helpers ----------

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    with app.app_context():
        db = get_db()
        with open(os.path.join(BASE_DIR, "schema.sql"), "r") as f:
            db.executescript(f.read())
        db.commit()


# ---------- Routes ----------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/todos", methods=["GET"])
def get_todos():
    db = get_db()
    rows = db.execute(
        "SELECT id, title, completed FROM todos ORDER BY id DESC"
    ).fetchall()
    todos = [
        {"id": row["id"], "title": row["title"], "completed": bool(row["completed"])}
        for row in rows
    ]
    return jsonify(todos)


@app.route("/api/todos", methods=["POST"])
def create_todo():
    data = request.get_json(force=True)
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    db = get_db()
    cur = db.execute(
        "INSERT INTO todos (title, completed) VALUES (?, ?)",
        (title, 0),
    )
    db.commit()
    todo_id = cur.lastrowid
    return jsonify({"id": todo_id, "title": title, "completed": False}), 201


@app.route("/api/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    data = request.get_json(force=True)
    title = data.get("title")
    completed = data.get("completed")

    db = get_db()
    row = db.execute("SELECT id FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Todo not found"}), 404

    if title is not None:
        title = title.strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400
        db.execute("UPDATE todos SET title = ? WHERE id = ?", (title, todo_id))

    if completed is not None:
        db.execute(
            "UPDATE todos SET completed = ? WHERE id = ?",
            (1 if completed else 0, todo_id),
        )

    db.commit()
    updated = db.execute(
        "SELECT id, title, completed FROM todos WHERE id = ?", (todo_id,)
    ).fetchone()
    return jsonify(
        {
            "id": updated["id"],
            "title": updated["title"],
            "completed": bool(updated["completed"]),
        }
    )


@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    db = get_db()
    row = db.execute("SELECT id FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Todo not found"}), 404

    db.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    db.commit()
    return jsonify({"status": "deleted", "id": todo_id})


if __name__ == "__main__":
    # create DB and tables if needed
    if not os.path.exists(DB_PATH):
        init_db()
    else:
        init_db()
    app.run(debug=True)
