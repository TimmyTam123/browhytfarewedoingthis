from flask import Flask, render_template, request, redirect, url_for, session, flash
import os
import database_manager as dbHandler

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Needed for sessions and flash messages

# ---------------------------
# ROUTES
# ---------------------------


@app.route("/leaderboard")
def leaderboard():
    return render_template("leaderboard.html")