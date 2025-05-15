from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
from datetime import datetime
from persiantools.jdatetime import JalaliDate
from ChartManager import CSPSchedule, CSPExamination

app = Flask(__name__)
app.secret_key = "your_secret_key"

DATABASE = "database.db"

def get_db_connection():
    return sqlite3.connect("database.db")

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        name_or_number = request.form["student_or_admin"]
        password = request.form["password"]
        user_type = request.form["user_type"]  

        conn = get_db_connection()
        cursor = conn.cursor()

        if user_type == "student":
            cursor.execute("SELECT * FROM students WHERE number = ? AND password = ?", (name_or_number, password))
            user = cursor.fetchone()
            if user:
                session["name"] = user[2] 
                conn.close()
                return redirect(url_for("main", student_name=user[2]))
        
        elif user_type == "admin":
            cursor.execute("SELECT * FROM admin WHERE name = ? AND password = ?", (name_or_number, password))
            user = cursor.fetchone()
            if user:
                session["admin"] = user[1]  
                conn.close()
                return redirect(url_for("admin", admin_name=user[1]))

        conn.close()
        return render_template("login.html", error="!نام کاربری یا رمز عبور اشتباه است")

    return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        student_id = request.form["number"]
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        if password != confirm_password:
            return render_template("signup.html", error="!رمز عبور و تایید آن یکسان نیست")

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM students WHERE number = ?", (student_id,))
        student = cursor.fetchone()

        if student:
            if student[3]:  
                conn.close()
                return render_template("signup.html", error="!شما قبلا ثبت‌نام کرده‌اید")

            cursor.execute("UPDATE students SET password = ? WHERE number = ?", (password, student_id))
            conn.commit()
            conn.close()
            return redirect(url_for("login"))
        else:
            conn.close()
            return render_template("signup.html", error="!شماره دانشجویی در سیستم ثبت نشده است")

    return render_template("signup.html")

@app.route("/main", methods=["GET", "POST"])
def main():
    if "name" not in session:
        return redirect(url_for("login"))
    student_name = request.args.get('student_name')
    return render_template("main.html", student_name=student_name)

@app.route("/admin", methods=["GET", "POST"])
def admin():
    if "admin" not in session:
        return redirect(url_for("login"))
    admin_name = request.args.get('admin_name')
    return render_template("admin.html", admin_name=admin_name)

@app.route("/send_messages", methods=["POST"])
def send_messages():
    data = request.get_json()
    message = data.get("message")
    sender = data.get("sender")
    
    if not message or not sender:
        return jsonify({"error": "Invalid data"}), 400

    time = datetime.now().strftime("%H:%M")
    date = datetime.now().strftime("%Y-%m-%d")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (message, sender, time, date) VALUES (?, ?, ?, ?)",
        (message, sender, time, date)
    )
    conn.commit()
    
    message_id = cursor.lastrowid 
    conn.close()

    return jsonify({"success": True, "messageId": message_id}) 

@app.route("/get_messages", methods=["GET"])
def get_messages():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, message, sender, time, date FROM messages ORDER BY id ASC")
    messages = cursor.fetchall()
    conn.close()

    messages_list = [
        {"id": row[0], "message": row[1], "sender": row[2], "time": row[3], "date": row[4]}
        for row in messages
    ]
    
    return jsonify(messages_list)

@app.route("/delete_message", methods=["POST"])
def delete_message():
    data = request.get_json()
    message_id = data.get("messageId")
    
    if not message_id:
        return jsonify({"error": "Invalid message ID"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
        message = cursor.fetchone()
        
        if message is None:
            return jsonify({"error": "پیام پیدا نشد."}), 404

        cursor.execute("DELETE FROM messages WHERE id = ?", (message_id,))
        conn.commit()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        print(f"Error deleting message: {e}")
        return jsonify({"error": "خطای سرور در حذف پیام"}), 500

@app.route("/save_courses", methods=["POST"])
def save_courses():
    try:
        data = request.get_json()
        courses = data.get("courses", [])

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM courses")

        cursor.execute("DELETE FROM sqlite_sequence WHERE name='courses'")

        for course in courses:
            cursor.execute(
                """
                INSERT INTO courses (subject, teacher, availability, days, length, year) 
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (course["subject"], course["teacher"], course["availability"], course["days"], course["length"], course["year"]),
            )

        conn.commit()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": "خطا در ذخیره اطلاعات"}), 500

@app.route('/load_courses', methods=['GET'])
def load_courses():
    conn = sqlite3.connect('database.db')  
    cursor = conn.cursor()
    
    cursor.execute('SELECT subject, teacher, availability, days, length, year FROM courses')
    rows = cursor.fetchall()
    
    conn.close()

    courses_list = []
    for row in rows:
        courses_list.append({
            'subject': row[0],
            'teacher': row[1],
            'availability': row[2],
            'days': row[3],
            'length': row[4],
            'year': row[5]
        })

    return jsonify(courses_list)
    
@app.route("/save_exams", methods=["POST"])
def save_exams():
    try:
        data = request.get_json()
        exams = data.get("exams", [])

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM exams")

        cursor.execute("DELETE FROM sqlite_sequence WHERE name='exams'")

        for exam in exams:
            cursor.execute(
                """
                INSERT INTO exams (subject, type, teacher, year) 
                VALUES (?, ?, ?, ?)
                """,
                (exam["subject"], exam["type"], exam["teacher"], exam["year"]),
            )

        conn.commit()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": "خطا در ذخیره اطلاعات"}), 500
    
@app.route('/load_exams', methods=['GET'])
def load_exams():
    conn = sqlite3.connect('database.db')  
    cursor = conn.cursor()
    
    cursor.execute('SELECT subject, type, teacher, year FROM exams')
    rows = cursor.fetchall()
    
    conn.close()

    exams_list = []
    for row in rows:
        exams_list.append({
            'subject': row[0],
            'type': row[1],
            'teacher': row[2],
            'year': row[3]
        })

    return jsonify(exams_list)
    
@app.route('/save_conflicts', methods=['POST'])
def save_conflicts():
    try:
        data = request.get_json()

        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()

        cursor.execute("DELETE FROM conflicts")

        cursor.execute("DELETE FROM sqlite_sequence WHERE name='conflicts'")

        for conflict in data:
            subject_one = conflict['subject_one']
            subject_two = conflict['subject_two']
            conflict_type = conflict['type']
            solve = conflict['solve']

            cursor.execute(
                '''
                INSERT INTO conflicts (subject_one, subject_two, type, solve)
                VALUES (?, ?, ?, ?)
                ''',
                (subject_one, subject_two, conflict_type, solve)
            )

        conn.commit()
        conn.close()

        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'error': 'خطا در ذخیره اطلاعات'}), 500

@app.route('/load_conflicts', methods=['GET'])
def load_conflicts():
    conn = sqlite3.connect('database.db')  
    cursor = conn.cursor()
    
    cursor.execute('SELECT subject_one, subject_two, type, solve FROM conflicts')
    rows = cursor.fetchall()
    
    conn.close()

    conflicts_list = []
    for row in rows:
        conflicts_list.append({
            'subject_one': row[0],
            'subject_two': row[1],
            'type': row[2],
            'solve': row[3],
        })

    return jsonify(conflicts_list)

@app.route("/generate_schedule", methods=["POST"])
def generate_schedule():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM chart") 
        conn.commit()
        
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='chart'") 
        conn.commit()

        scheduler = CSPSchedule()
        best_schedules = scheduler.solve()

        return jsonify({"success": True, "message": "برنامه درسی برای تمام ورودی‌ها با موفقیت ساخته شد!"})

    except Exception as e:
        return jsonify({"success": False, "message": f"خطا در ساخت برنامه: {e}"})

@app.route("/generate_examination", methods=["POST"])
def generate_examination():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()

        cursor.execute("UPDATE exams SET date = NULL, time = NULL")
        conn.commit()

        scheduler = CSPExamination()
        scheduler.schedule_exams()

        return jsonify({"success": True, "message": "برنامه امتحانات با موفقیت ساخته شد!"})

    except Exception as e:
        return jsonify({"success": False, "message": f"خطا در زمان‌بندی امتحانات: {e}"})
    
@app.route("/api/show-schedule", methods=["GET"])
def schedule_api():
    return jsonify(get_schedule())
def get_schedule():
    conn = sqlite3.connect("database.db")  
    cursor = conn.cursor()

    cursor.execute("SELECT subject, teacher, year, day, start, end FROM chart")
    rows = cursor.fetchall()
    conn.close()

    # تبدیل داده‌ها به فرمت JSON
    schedule = []
    for row in rows:
        schedule.append({
            "subject": row[0], 
            "teacher": row[1],  
            "year": row[2], 
            "day": row[3],  
            "start": row[4],  
            "end": row[5]  
        })

    return schedule
    
@app.route("/api/show-examination", methods=["GET"])
def examination_api():
    return jsonify(get_examination())
def fix_date_format(date_str):
    parts = date_str.split("/")
    return f"{parts[0]}/{parts[1].zfill(2)}/{parts[2].zfill(2)}" 
def get_examination():
    conn = sqlite3.connect("database.db")  
    cursor = conn.cursor()

    cursor.execute("SELECT date, time, year, teacher, type, subject FROM exams")
    rows = cursor.fetchall()
    conn.close()

    exams = []
    for row in rows:
        exams.append({
            "date": fix_date_format(row[0]), 
            "time": row[1],   
            "year": row[2],  
            "teacher": row[3], 
            "type": row[4],   
            "subject": row[5]  
        })

    return exams

@app.route("/solve_confliction", methods=["POST"])
def solve_confliction():
    scheduler = CSPSchedule()
    scheduler.resolve_conflicts()

    return jsonify({"success": True})
    
@app.route("/logout")
def logout():
    session.clear()
    return render_template("logout.html")

if __name__ == "__main__":
    app.run(debug=True)
