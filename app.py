# Your existing Flask app code here
from flask import Flask, render_template, request, redirect, url_for, flash, session
import os

app = Flask(__name__)

# IMPORTANT: Session configuration for production
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-this-to-something-random')

# Critical session settings for Vercel/production
app.config['SESSION_COOKIE_SECURE'] = True  # Only send cookie over HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Allow cookies across same-site navigation
app.config['PERMANENT_SESSION_LIFETIME'] = 1800  # Session lasts 30 minutes

# Your routes here
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Your authentication logic here
        if username == 'tim' and password == 'password123':  # Replace with real auth
            session['user'] = username
            session.permanent = True  # Make session persistent
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password', 'danger')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Your signup logic
        flash('Account created successfully!', 'success')
        return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/home')
def home():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('home.html')

@app.route('/profile')
def profile():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('profile.html')

@app.route('/leaderboard')
def leaderboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('leaderboard.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

# IMPORTANT: This is required for Vercel
# Do NOT use app.run() for production
if __name__ == '__main__':
    app.run(debug=True)  # Only for local development