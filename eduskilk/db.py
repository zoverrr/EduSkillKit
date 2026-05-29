"""SQLite 数据层 — 存储对话历史与自定义 Skill 元数据"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime
from contextlib import contextmanager

from eduskilk.config import DB_PATH, ensure_dirs


def init_db():
    """初始化数据库表"""
    ensure_dirs()
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                skill_name TEXT,
                model TEXT,
                provider TEXT,
                created_at TEXT NOT NULL,
                messages TEXT NOT NULL DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS custom_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                display_name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                skill_dir TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)


@contextmanager
def get_conn():
    """获取数据库连接的上下文管理器"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


# ── 对话 CRUD ──

def save_conversation(title: str, skill_name: str, model: str,
                      provider: str, messages: list) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO conversations (title, skill_name, model, provider, created_at, messages) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (title, skill_name, model, provider,
             datetime.now().isoformat(), json.dumps(messages, ensure_ascii=False)),
        )
        return cur.lastrowid


def update_conversation(conv_id: int, messages: list, title: str = None):
    with get_conn() as conn:
        if title:
            conn.execute(
                "UPDATE conversations SET messages=?, title=? WHERE id=?",
                (json.dumps(messages, ensure_ascii=False), title, conv_id),
            )
        else:
            conn.execute(
                "UPDATE conversations SET messages=? WHERE id=?",
                (json.dumps(messages, ensure_ascii=False), conv_id),
            )


def list_conversations(limit: int = 50) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, title, skill_name, model, provider, created_at "
            "FROM conversations ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_conversation(conv_id: int) -> dict | None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM conversations WHERE id=?", (conv_id,)
        ).fetchone()
        if row:
            d = dict(row)
            d["messages"] = json.loads(d["messages"])
            return d
        return None


def delete_conversation(conv_id: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM conversations WHERE id=?", (conv_id,))


# ── 自定义 Skill CRUD ──

def save_custom_skill(name: str, display_name: str, description: str,
                      category: str, skill_dir: str):
    now = datetime.now().isoformat()
    with get_conn() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO custom_skills "
            "(name, display_name, description, category, skill_dir, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (name, display_name, description, category, skill_dir, now, now),
        )


def list_custom_skills() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM custom_skills ORDER BY updated_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


def delete_custom_skill(name: str):
    with get_conn() as conn:
        conn.execute("DELETE FROM custom_skills WHERE name=?", (name,))
