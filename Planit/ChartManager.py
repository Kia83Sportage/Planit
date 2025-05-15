import sqlite3
from datetime import datetime, timedelta
import jdatetime
from flask import flash

class CSPSchedule:
    def __init__(self, db_path="database.db"):
        self.db_path = db_path
        self.days_of_week = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه"]
        self.hours_per_day = [i + 0.5 * j for i in range(8, 18) for j in range(2)]
        self.courses_by_year = {}
        self.teachers_availability = {}
        self.load_data()

    def get_db_connection(self):
        return sqlite3.connect(self.db_path)

    def load_data(self):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT subject, teacher, availability, days, length, year FROM courses")
        courses_data = cursor.fetchall()

        self.courses_by_year = {}
        for subject, teacher, availability, days, length, year in courses_data:
            available_days = [day.strip() for day in availability.split()]

            if year not in self.courses_by_year:
                self.courses_by_year[year] = []

            self.courses_by_year[year].append({
                "subject": subject,
                "teacher": teacher,
                "available_days": available_days,
                "days": days,
                "length": length,
                "year": year
            })

            if teacher not in self.teachers_availability:
                self.teachers_availability[teacher] = available_days

        conn.close()

    def solve(self):
        best_schedules = {}
        teacher_schedule = {}

        for year, courses in self.courses_by_year.items():
            schedule = []
            year_schedule = {}

            fixed_courses = [c for c in courses if len(c["available_days"]) == 1]  
            flexible_courses = [c for c in courses if len(c["available_days"]) > 1]  

            for course in fixed_courses:
                teacher = course["teacher"]
                day = course["available_days"][0]
                
                start_hour = self.find_valid_hour(teacher, year, day, course["length"], teacher_schedule, year_schedule)
                if start_hour is None:
                    print(f"⚠️ ظرفیت برای درس '{course['subject']}' در روز {day} پر است! ممکن است حذف شود.")
                    continue

                end_hour = start_hour + course["length"]
                schedule.append((course["subject"], teacher, course["year"], day, start_hour, end_hour))

                self.add_to_schedule(teacher_schedule, teacher, day, start_hour, end_hour)
                self.add_to_schedule(year_schedule, year, day, start_hour, end_hour)

            available_days_count = {day: 0 for day in self.days_of_week}  
            
            for course in flexible_courses:
                teacher = course["teacher"]
                available_days = self.teachers_availability.get(teacher, [])
                course_days = min(course["days"], len(available_days))

                if course_days == 0:
                    print(f"⚠️ استاد {teacher} هیچ روزی برای تدریس '{course['subject']}' آزاد نیست!")
                    continue

                sorted_days = sorted(available_days, key=lambda d: available_days_count[d])
                selected_days = sorted_days[:course_days]

                for day in selected_days:
                    start_hour = self.find_valid_hour(teacher, year, day, course["length"], teacher_schedule, year_schedule)
                    if start_hour is None:
                        print(f"⚠️ ظرفیت برای درس '{course['subject']}' در روز {day} پر است! ممکن است حذف شود.")
                        continue

                    end_hour = start_hour + course["length"]
                    schedule.append((course["subject"], teacher, course["year"], day, start_hour, end_hour))

                    self.add_to_schedule(teacher_schedule, teacher, day, start_hour, end_hour)
                    self.add_to_schedule(year_schedule, year, day, start_hour, end_hour)
                    
                    available_days_count[day] += 1  

            best_schedules[year] = schedule

        self.save_to_database(best_schedules)
        return best_schedules

    def find_valid_hour(self, teacher, year, day, length, teacher_schedule, year_schedule):
        valid_hours = [h for h in self.hours_per_day if h + length <= 17.5]

        new_valid_hours = []
        for h in valid_hours:
            new_valid_hours.append(h)

        valid_hours = new_valid_hours

        if teacher in teacher_schedule:
            busy_times = teacher_schedule[teacher]
            valid_hours = [h for h in valid_hours if not any(
                existing_day == day and existing_start <= h < existing_end
                for existing_day, existing_start, existing_end in busy_times
            )]

        if year in year_schedule:
            busy_times = year_schedule[year]
            valid_hours = [h for h in valid_hours if not any(
                existing_day == day and existing_start <= h < existing_end
                for existing_day, existing_start, existing_end in busy_times
            )]

        return valid_hours[0] if valid_hours else None

    def add_to_schedule(self, schedule, key, day, start_hour, end_hour):
        if key not in schedule:
            schedule[key] = []
        schedule[key].append((day, start_hour, end_hour))

    def save_to_database(self, best_schedules):
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM chart")  
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='chart'") 
        conn.commit()
        
        for year, schedule in best_schedules.items():
            for lesson in schedule:
                cursor.execute(''' 
                    INSERT INTO chart (subject, teacher, year, day, start, end) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', lesson)
        conn.commit()
        conn.close()
        
    def resolve_conflicts(self):

        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT subject_one, subject_two FROM conflicts WHERE type = 'درس' AND solve = 'درحال بررسی'")
        conflicts = cursor.fetchall()

        if not conflicts:
            return

        conflict_set = {(sub1, sub2) for sub1, sub2 in conflicts}

        cursor.execute("SELECT id, subject, teacher, year, day, start, end FROM chart")
        schedule = cursor.fetchall()
        suggestions = []
        lessons_by_subject = {}
        for lesson in schedule:
            lesson_id, subject, teacher, year, day, start, end = lesson
            if subject not in lessons_by_subject:
                lessons_by_subject[subject] = []
            lessons_by_subject[subject].append(lesson)

        for subject_one, subject_two in conflict_set:
            if subject_one in lessons_by_subject and subject_two in lessons_by_subject:
                for lesson_one in lessons_by_subject[subject_one]:
                    for lesson_two in lessons_by_subject[subject_two]:
                        id_one, subject_one, teacher_one, year_one, day_one, start_one, end_one = lesson_one
                        id_two, subject_two, teacher_two, year_two, day_two, start_two, end_two = lesson_two

                        if day_one == day_two and not (end_one <= start_two or end_two <= start_one):
                            for lesson in [lesson_one, lesson_two]:
                                lesson_id, subject, teacher, year, day, start, end = lesson
                                lesson_length = end - start

                                cursor.execute("SELECT start, end FROM chart WHERE day = ? AND teacher = ?", (day, teacher))
                                busy_hours = cursor.fetchall()

                                valid_hours = [h for h in range(8, 18) if h + lesson_length <= 17 and h != 12]
                                valid_hours = [h for h in valid_hours if all(h >= e or h + lesson_length <= s for s, e in busy_hours)]

                                if valid_hours:
                                    new_start = valid_hours[0]
                                    new_end = new_start + lesson_length
                                    suggestions.append(f"✅ درس {subject} در روز {day} را از ساعت {start}-{end} به {new_start}-{new_end} تغییر دهید.")
                                    break  
        conn.close()
        
        
class CSPExamination:
    def __init__(self, db_path="database.db"):
        self.db_path = db_path
        self.days = self.generate_exam_days()

    def to_persian_date(self, date_str):
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        jalali_date = jdatetime.date.fromgregorian(date=date_obj)
        return jalali_date.strftime("%Y/%m/%d")

    def generate_exam_days(self):
        start_date = datetime.today()
        exam_days = []
        while len(exam_days) < 10:
            if start_date.weekday() != 4:  
                exam_days.append(start_date.strftime("%Y-%m-%d"))
            start_date += timedelta(days=1)
        return exam_days

    def schedule_exams(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT id, subject, type, teacher, year FROM exams WHERE date IS NULL AND time IS NULL")
        exams = cursor.fetchall()

        general_exams = [e for e in exams if e[2] == "عمومی"]
        basic_exams = [e for e in exams if e[2] == "پایه"]
        other_exams = [e for e in exams if e[2] not in ["عمومی", "پایه"]]

        exams_by_year = {}
        for exam in exams:
            year = exam[4]
            if year not in exams_by_year:
                exams_by_year[year] = []
            exams_by_year[year].append(exam)

        schedule = {day: {"09:00-11:00": [], "13:30-15:30": []} for day in self.days}

        def assign_exam(exam_list, time_slot, allowed_days):
            nonlocal schedule
            last_exam_day = {}

            for day in allowed_days:
                if len(schedule[day][time_slot]) < 2:
                    i = 0
                    while i < len(exam_list):
                        exam = exam_list[i]
                        year = exam[4]

                        if year not in last_exam_day or (datetime.strptime(day, "%Y-%m-%d") - last_exam_day[year]).days >= 2:
                            schedule[day][time_slot].append(exam)
                            last_exam_day[year] = datetime.strptime(day, "%Y-%m-%d")
                            exam_list.pop(i)  
                        else:
                            i += 1  

                        if len(schedule[day][time_slot]) >= 2:
                            break  

                    if not exam_list:
                        break  

        for day in self.days:
            if datetime.strptime(day, "%Y-%m-%d").weekday() == 3:  
                assign_exam(general_exams, "09:00-11:00", [day])
                assign_exam(general_exams, "13:30-15:30", [day])

        allowed_days = [day for day in self.days if datetime.strptime(day, "%Y-%m-%d").weekday() != 3]  # پنج‌شنبه حذف شود
        assign_exam(basic_exams, "09:00-11:00", allowed_days)

        assign_exam(other_exams, "09:00-11:00", allowed_days)
        assign_exam(other_exams, "13:30-15:30", allowed_days)

        for day, times in schedule.items():
            jalali_day = self.to_persian_date(day)
            for time_slot, exams in times.items():
                for exam in exams:
                    exam_id = exam[0]
                    cursor.execute("UPDATE exams SET date = ?, time = ? WHERE id = ?", (jalali_day, time_slot, exam_id))

        conn.commit()
        conn.close()
        print("✅ برنامه امتحانات با موفقیت ذخیره شد!")
