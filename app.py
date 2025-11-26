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

@app.route("/profile")
def profile():
   return render_template("profile.html")


# ---------------------------
# SIGNUP
# ---------------------------
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            flash("Please enter both username and password.", "warning")
            return render_template("signup.html")

        if dbHandler.create_user(username, password):
            flash("Signup successful! Please log in.", "success")
            return redirect(url_for("login"))
        else:
            flash("Username already exists. Please try a different one.", "danger")
    
    return render_template("signup.html")


# ---------------------------
# HOME ROUTE
# ---------------------------
@app.route('/')
def home():
    # If logged in, show index.html
    if "username" in session:
        return render_template("index.html", username=session["username"])
    return redirect(url_for("login"))

# ---------------------------
# LOGIN
# ---------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            flash("Please enter both username and password.", "warning")
            return render_template("login.html")

        if dbHandler.verify_user(username, password):
            session["username"] = username
            flash("Login successful!", "success")
            # Redirect to index.html (home page)
            return redirect(url_for("home"))
        else:
            flash("Invalid username or password. Please try again.", "danger")

    return render_template("login.html")



# ---------------------------
# LOGOUT
# ---------------------------
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


# ---------------------------
# MESSAGES PAGE (example protected route)
# ---------------------------
@app.route("/messages")
def messages():
    if "username" not in session:
        flash("Please log in first.", "warning")
        return redirect(url_for("login"))
    return render_template("messages.html", username=session["username"])


# ---------------------------
# RUN APP
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)
