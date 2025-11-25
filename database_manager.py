import os
import sqlite3 as sql
from werkzeug.security import generate_password_hash, check_password_hash

def listExtension():
    db_path = os.path.join(os.path.dirname(__file__), "database/data_source.db")
    con = sql.connect(db_path)
    cur = con.cursor()
    data = cur.execute("SELECT * FROM extension").fetchall()
    con.close()
    return data


def create_user(username, password):
    db_path = os.path.join(os.path.dirname(__file__), "database/data_source.db")
    con = sql.connect(db_path)
    cur = con.cursor()
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
    db_path = os.path.join(os.path.dirname(__file__), "database/data_source.db")
    con = sql.connect(db_path)
    cur = con.cursor()
    cur.execute("SELECT Password FROM user WHERE Username = ?", (username,))
    user = cur.fetchone()
    con.close()
    if user:
        return check_password_hash(user[0], password)
    return False