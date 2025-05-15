import sqlite3
import random
import string

DATABASE = "database.db"

def generate_student_id(length=8):
    return ''.join(random.choices(string.digits, k=length))

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()

        # Admin
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
        ''')

        # Students
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NULL
        )
        ''')

        # Courses
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            teacher TEXT NOT NULL,
            availability TEXT NOT NULL,
            days INTEGER NOT NULL,
            length REAL NOT NULL,
            year INTEGER NOT NULL
        )
        ''')
        
        # Exams
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            type TEXT NOT NULL,
            teacher TEXT NOT NULL,
            date TEXT NULL,
            time TEXT NULL,
            year INTEGER NOT NULL
        )
        ''')

        # Conflicts
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS conflicts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_one TEXT NOT NULL,
            subject_two TEXT NOT NULL,
            type TEXT NOT NULL,
            solve TEXT NOT NULL
        )
        ''')
        
        # Chart
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS chart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            teacher TEXT NOT NULL,
            year INTEGER NOT NULL,
            day TEXT NOT NULL,
            start INTEGER NOT NULL,
            end INTEGER NOT NULL
        )
        ''')
        
        # Messages
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            sender TEXT NOT NULL,
            time TEXT NOT NULL,
            date INTEGER NOT NULL
        )
        ''')
        
        conn.commit()

if __name__ == '__main__':
    init_db()
    print("Database and tables created successfully.")
