import os
import sqlite3 as sql
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "database/data_source.db")


def create_user(username, password):
    con = sql.connect(DB_PATH)
    cur = con.cursor()

    # Check if username exists
    cur.execute("SELECT 1 FROM user WHERE Username = ?", (username,))
    if cur.fetchone():
        con.close()
        return False

    hashed_password = generate_password_hash(password, method="pbkdf2:sha256")

    try:
        cur.execute(
            "INSERT INTO user (Username, Password, Account_Creation_date) VALUES (?, ?, DATE('now'))",
            (username, hashed_password),
        )
        con.commit()
        return True
    finally:
        con.close()


def verify_user(username, password):
    con = sql.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT Password FROM user WHERE Username = ?", (username,))
    user = cur.fetchone()
    con.close()
    if user:
        return check_password_hash(user[0], password)
    return False
