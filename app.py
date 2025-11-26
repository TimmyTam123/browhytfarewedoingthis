from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_session import Session
import redis
import os
from datetime import timedelta

# --- Flask App ---
app = Flask(__name__)

# Secret key
app.secret_key = os.environ.get('SECRET_KEY', 'replace-with-a-random-secret')

# --- Flask-Session Configuration ---
app.config['SESSION_TYPE'] = 'redis'              # Use Redis backend
app.config['SESSION_PERMANENT'] = True            # Make sessions permanent
app.config['SESSION_USE_SIGNER'] = True           # Sign session cookies for security
app.config['SESSION_KEY_PREFIX'] = 'flask_session:'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
app.config['SESSION_COOKIE_SECURE'] = True        # Only send cookie over HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True      # Prevent JS access
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'     # Normal navigation
app.config['SESSION_COOKIE_PATH'] = '/'           # Cookie path

# Redis connection (managed Redis on Vercel)
redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
app.config['SESSION_REDIS'] = redis.from_url(redis_url)

# Initialize server-side session
Session(app)

# --- Routes ---
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Authentication logic (replace with real auth)
        if username == 'tim' and password == 'password123':
            session['user'] = username
            session.permanent = True
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password', 'danger')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Signup logic here
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

# --- Only for local testing ---
if __name__ == '__main__':
    app.run(debug=True)