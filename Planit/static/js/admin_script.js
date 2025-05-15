// Switch Between Tabs
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-button');

  tabs.forEach(tab => {
    tab.classList.remove('active');
  });

  buttons.forEach(button => {
    button.classList.remove('active');
  });

  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// Courses Management
function addCourse() {
    let year = document.getElementById("year").value.trim();
    let length = document.getElementById("length").value.trim();
    let numOfDays = document.getElementById("days").value.trim();
    let teacherAvailability = document.getElementById("availability").value;
    let teacherName = document.getElementById("teacher").value;
    let courseName = document.getElementById("subject").value;

    if (year.trim() === "" || length.trim() === "" || numOfDays.trim() === "" || teacherAvailability.trim() === "" || teacherName.trim() === "" || courseName.trim() === "") {
        alert("لطفاً تمامی فیلدها را پر کنید!");
        return;
    }

    let tableBody = document.querySelector("#courses-table tbody");

    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <button onclick="courseEditRow(this)">
                <img src="../static/media/icons/edit.png" alt="ویرایش" width="24">
            </button>
            <button onclick="deleteRow(this)">
                <img src="../static/media/icons/delete.png" alt="حذف" width="20">
            </button>
        </td>
        <td>${year}</td>
        <td>${length}</td>
        <td>${numOfDays}</td>
        <td>${teacherAvailability}</td>
        <td>${teacherName}</td>
        <td>${courseName}</td>
    `;

    tableBody.appendChild(newRow);

    document.getElementById("year").value = "";
    document.getElementById("length").value = "";
    document.getElementById("days").value = "";
    document.getElementById("availability").value = "";
    document.getElementById("teacher").value = "";
    document.getElementById("subject").value = "";
}
function saveCourses() {
  let tableRows = document.querySelectorAll("#courses-table tbody tr");
  let courses = [];

  tableRows.forEach(row => {
      let courseData = {
          subject: row.cells[6].innerText,
          teacher: row.cells[5].innerText,
          availability: row.cells[4].innerText,
          days: parseInt(row.cells[3].innerText),
          length: parseFloat(row.cells[2].innerText),
          year: parseInt(row.cells[1].innerText)
      };
      courses.push(courseData);
  });

  fetch("/save_courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courses: courses }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("✅ اطلاعات با موفقیت ذخیره شد!");
      } else {
          alert("❌ خطا در ذخیره اطلاعات!");
      }
  })
  .catch(error => {
      alert("خطای ارتباط با سرور.");
  });
}
function loadCourses() {
  fetch('/load_courses')
      .then(response => response.json())
      .then(data => {
          const tableBody = document.querySelector('#courses-table tbody');
          tableBody.innerHTML = ''; 

          data.forEach(course => {
              const row = document.createElement('tr');

              row.innerHTML = `
                  <td>
                      <button onclick="courseEditRow(this)">
                          <img src="../static/media/icons/edit.png" alt="ویرایش" width="24">
                      </button>
                      <button onclick="deleteRow(this)">
                        <img src="../static/media/icons/delete.png" alt="حذف" width="20">
                      </button>
                  </td>
                  <td>${course.year}</td>
                  <td>${course.length}</td>
                  <td>${course.days}</td>
                  <td>${course.availability}</td>
                  <td>${course.teacher}</td>
                  <td>${course.subject}</td>
              `;

              tableBody.appendChild(row);
          });
      })
      .catch(error => console.error('خطا در دریافت دروس', error));
}

// Exams Management
function addExam() {
  let year = document.getElementById("exam-year").value.trim();
  let teacher = document.getElementById("exam-teacher").value;
  let type = document.getElementById("type").value;
  let subject = document.getElementById("course").value;

  if (year.trim() === "" || teacher.trim() === "" || type.trim() === "" || subject.trim() === "") {
      alert("لطفاً تمامی فیلدها را پر کنید!");
      return;
  }

  let tableBody = document.querySelector("#exams-table tbody");

  let newRow = document.createElement("tr");
  newRow.innerHTML = `
      <td>
          <button onclick="examEditRow(this)">
              <img src="../static/media/icons/edit.png" alt="ویرایش" width="24">
          </button>
          <button onclick="deleteRow(this)">
              <img src="../static/media/icons/delete.png" alt="حذف" width="20">
          </button>
      </td>
      <td>${year}</td>
      <td>${teacher}</td>
      <td>${type}</td>
      <td>${subject}</td>
  `;

  tableBody.appendChild(newRow);

  document.getElementById("exam-year").value = "";
  document.getElementById("exam-teacher").value = "";
  document.getElementById("type").value = "";
  document.getElementById("course").value = "";
}
function saveExams() {
  let tableRows = document.querySelectorAll("#exams-table tbody tr");
  let exams = [];

  tableRows.forEach(row => {
      let examData = {
          subject: row.cells[4].innerText,
          type: row.cells[3].innerText,
          teacher: row.cells[2].innerText,
          year: parseInt(row.cells[1].innerText)
      };
      exams.push(examData);
  });

  fetch("/save_exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exams: exams }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("✅ اطلاعات با موفقیت ذخیره شد!");
      } else {
          alert("❌ خطا در ذخیره اطلاعات!");
      }
  })
  .catch(error => {
      alert("خطای ارتباط با سرور.");
  });
}
function loadExams() {
  fetch('/load_exams')
      .then(response => response.json())
      .then(data => {
          const tableBody = document.querySelector('#exams-table tbody');
          tableBody.innerHTML = ''; 

          data.forEach(exam => {
              const row = document.createElement('tr');

              row.innerHTML = `
                  <td>
                      <button onclick="examEditRow(this)">
                          <img src="../static/media/icons/edit.png" alt="ویرایش" width="24">
                      </button>
                      <button onclick="deleteRow(this)">
                        <img src="../static/media/icons/delete.png" alt="حذف" width="20">
                      </button>
                  </td>
                  <td>${exam.year}</td>
                  <td>${exam.teacher}</td>
                  <td>${exam.type}</td>
                  <td>${exam.subject}</td>
              `;

              tableBody.appendChild(row);
          });
      })
      .catch(error => console.error('خطا در دریافت امتحانات', error));
}

// Conflicts Management
function addConflict() {
  let type = document.getElementById("typeSelection").value;
  let subjectOne = document.getElementById("subject_one").value;
  let subjectTwo = document.getElementById("subject_two").value;

  if (subjectOne.trim() === "" || subjectTwo.trim() === "") {
    alert("لطفاً همه فیلدها را پر کنید!");
    return;
  }

  let table = document.getElementById("conflicts-table").getElementsByTagName("tbody")[0];
  let newRow = table.insertRow();

  let cellActions = newRow.insertCell(0);
  let cellStatus = newRow.insertCell(1);
  let cellType = newRow.insertCell(2);
  let cellSubjectTwo = newRow.insertCell(3);
  let cellSubjectOne = newRow.insertCell(4);

  cellStatus.innerText = "درحال بررسی"; 
  cellType.innerText = type;
  cellSubjectTwo.innerText = subjectTwo;
  cellSubjectOne.innerText = subjectOne;

  let deleteButton = document.createElement("button");
  let doneButton = document.createElement("button");
  doneButton.innerHTML = '<img src="../static/media/icons/checkbox.png" alt="اصلاح" width="27">';
  deleteButton.innerHTML = '<img src="../static/media/icons/delete.png" alt="حذف" width="20">';
  deleteButton.onclick = function () {
    newRow.remove();
  };
  doneButton.onclick = function () {
    let row = doneButton.closest("tr");
    let cells = row.querySelectorAll("td");

    cells[1].innerText = "رفع شده";
  };
  cellActions.appendChild(doneButton);
  cellActions.appendChild(deleteButton);

  document.getElementById("subject_one").value = "";
  document.getElementById("subject_two").value = "";
  document.getElementById("type").value = "";
}
function saveConflicts() {
  const rows = document.querySelectorAll('#conflicts-table tbody tr');
  let data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const conflictsData = {
      subject_one: cells[4].innerText,  
      subject_two: cells[3].innerText,  
      type: cells[2].innerText,  
      solve: cells[1].innerText,  
    };
    data.push(conflictsData);
  });

  fetch('/save_conflicts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),  
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("✅ اطلاعات با موفقیت ذخیره شد!");
    } else {
      alert("❌ خطا در ذخیره اطلاعات!");
    }
  })
  .catch((error) => {
    alert("خطای ارتباط با سرور.");
  });
}
function loadConflicts() {
  fetch('/load_conflicts')
      .then(response => response.json())
      .then(data => {
          const tableBody = document.querySelector('#conflicts-table tbody');
          tableBody.innerHTML = ''; 

          data.forEach(conflict => {
              const row = document.createElement('tr');

              row.innerHTML = `
                  <td>
                      <button onclick="doneRow(this)">
                          <img src="../static/media/icons/checkbox.png" alt="اصلاح" width="27">
                      </button>
                      <button onclick="deleteRow(this)">
                          <img src="../static/media/icons/delete.png" alt="حذف" width="20">
                      </button>
                  </td>
                  <td>${conflict.solve}</td>
                  <td>${conflict.type}</td>
                  <td>${conflict.subject_two}</td>
                  <td>${conflict.subject_one}</td>
              `;

              tableBody.appendChild(row);
          });
      })
      .catch(error => console.error('خطا در دریافت تداخلات', error));
}

// Deletion And Edition
function deleteRow(button) {
  let row = button.closest("tr");
  row.remove();
}
function doneRow(button) {
    let row = button.closest("tr");
    let cells = row.querySelectorAll("td");

    cells[1].innerText = "رفع شده";
}
function courseEditRow(button) {
  let row = button.closest("tr");
  let cells = row.querySelectorAll("td");

  let newYear = prompt("سال ورودی:", cells[1].innerText);
  let newLength = prompt("مدت کلاس:", cells[2].innerText);
  let newDays = prompt("تعداد روز ارائه:", cells[3].innerText);
  let newAvailability = prompt("زمان آزاد استاد:", cells[4].innerText);

  if (newYear) cells[1].innerText = newYear;
  if (newLength) cells[2].innerText = newLength;
  if (newDays) cells[3].innerText = newDays;
  if (newAvailability) cells[4].innerText = newAvailability;
}
function examEditRow(button) {
  let row = button.closest("tr");
  let cells = row.querySelectorAll("td");

  let newYear = prompt("سال ورودی:", cells[1].innerText);
  let newTime = prompt("زمان امتحان:", cells[2].innerText);
  let newDate = prompt("تاریخ امتحان:", cells[3].innerText);
  let newType = prompt("نوع درس:", cells[5].innerText);

  if (newYear) cells[1].innerText = newYear;
  if (newTime) cells[2].innerText = newTime;
  if (newDate) cells[3].innerText = newDate;
  if (newType) cells[5].innerText = newType;
}

// Generate Schedule
function generateSchedule() {
  fetch("/generate_schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("✅ موفقیت: " + data.message); 
          showSchedule(); 
      } else {
          alert("❌ خطا: " + data.message);  
      }
  })
  .catch(error => alert("⚠️ مشکلی پیش آمد: " + error));
}
async function showSchedule() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/show-schedule");
        const data = await response.json();

        document.querySelectorAll(".time-block").forEach(cell => {
            cell.innerHTML = "";
            cell.style.backgroundColor = "#fff";
            cell.removeAttribute("colspan");
            cell.dataset.subject = "";
            cell.dataset.teacher = "";
            cell.dataset.merged = "false";
            cell.style.display = "table-cell";
        });

        const groupColors = {
            "1400": "#FFDDC1",  
            "1401": "#D1F0FF",  
            "1402": "#C1FFD7",  
            "1403": "#FFD1E1"   
        };

        data.forEach(item => {
            let dayIndex = days.indexOf(item.day);
            let groupIndex = groups.indexOf(item.year.toString());

            if (dayIndex !== -1 && groupIndex !== -1) {
                let startHour = Math.floor(item.start);
                let startMin = (item.start % 1 === 0) ? "00" : "30";
                let endHour = Math.floor(item.end);
                let endMin = (item.end % 1 === 0) ? "00" : "30";

                let firstCell = null;
                let totalBlocks = Math.round((item.end - item.start) * 2); 

                for (let i = 0; i < totalBlocks; i++) {
                    let timeSlot = item.start + (i * 0.5);
                    let blockStartHour = Math.floor(timeSlot);
                    let blockStartMin = (timeSlot % 1 === 0) ? "00" : "30";
                    let blockEndHour = (blockStartMin === "00") ? blockStartHour : blockStartHour + 1;
                    let blockEndMin = (blockStartMin === "00") ? "30" : "00";

                    let cellId = `day${dayIndex}-group${groupIndex}-${blockStartHour}:${blockStartMin}-${blockEndHour}:${blockEndMin}`;
                    let cell = document.getElementById(cellId);

                    if (i === 0) {
                        cell.innerHTML = `<strong>${item.subject}</strong> (${item.teacher})`;
                        cell.style.backgroundColor = groupColors[item.year.toString()];
                        cell.dataset.subject = item.subject;
                        cell.dataset.teacher = item.teacher;
                        cell.dataset.merged = "true";
                        firstCell = cell;
                    } else {
                        if (cell) {
                            cell.style.display = "none";
                        }
                    }
                }

                if (firstCell) {
                    firstCell.setAttribute("colspan", totalBlocks);
                }
            }
        });
    } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
    }
}

// Generate Examination
function generateExamination() {
    fetch("/generate_examination", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("✅ موفقیت: " + data.message); 
            showSchedule(); 
        } else {
            alert("❌ خطا: " + data.message);  
        }
    })
    .catch(error => alert("⚠️ مشکلی پیش آمد: " + error));
}
async function showExamination() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/show-examination");
        const exams = await response.json();

        let tbody = document.querySelector(".examination-table tbody");
        tbody.innerHTML = "";  

        const colors = ["#FFDDC1", "#D1F0FF", "#FFDDC1", "#D1F0FF", "#C1FFD7", "#FFD1E1"];

        let examDays = getExamDates();

        let overflowExams = []; 

        examDays.forEach(({ day, date }, index) => {
            let dailyExams = exams.filter(exam => exam.date === date);

            if (overflowExams.length > 0) {
                dailyExams = [...overflowExams, ...dailyExams];
                overflowExams = [];
            }

            let morningExams = dailyExams.filter(exam => exam.time === "09:00-11:00");
            let afternoonExams = dailyExams.filter(exam => exam.time === "13:30-15:30");

            if (morningExams.length > 2) {
                overflowExams.push(...morningExams.slice(2));
                morningExams = morningExams.slice(0, 2);
            }

            if (afternoonExams.length > 2) {
                overflowExams.push(...afternoonExams.slice(2));
                afternoonExams = afternoonExams.slice(0, 2);
            }

            let row = document.createElement("tr");
            row.innerHTML = `<td rowspan="4">${day}</td>`;
            row.innerHTML += `<td rowspan="4">${date}</td>`;

            let allExams = [...morningExams, ...Array(2 - morningExams.length).fill(null), ...afternoonExams, ...Array(2 - afternoonExams.length).fill(null)];

            allExams.forEach((exam, idx) => {
                if (idx > 0) row = document.createElement("tr");

                row.innerHTML += `<td>${idx < 2 ? "09:00-11:00" : "13:30-15:30"}</td>`;

                if (exam) {
                    let color = colors[parseInt(exam.year) % colors.length];
                    row.innerHTML += `
                        <td style="background-color: ${color}">${exam.year}</td>
                        <td style="background-color: ${color}">${exam.teacher}</td>
                        <td style="background-color: ${color}">${exam.type}</td>
                        <td style="background-color: ${color}">${exam.subject}</td>
                    `;
                } else {
                    row.innerHTML += `<td></td><td></td><td></td><td></td>`;
                }

                tbody.appendChild(row);
            });
        });
    } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
    }
    function enableRowSelection() {
        const rows = document.querySelectorAll(".examination-table tbody tr");
    
        rows.forEach(row => {
            row.addEventListener("click", () => {
                rows.forEach(r => r.classList.remove("selected-row"));
                
                row.classList.add("selected-row");
            });
        });
    }
    enableRowSelection();
}

// Solve Confliction
function solveConfliction() {
    fetch("/solve_confliction", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
}

// Schedule Drag And Drop
function enableCourseDragAndDrop() {
  document.querySelectorAll(".time-block").forEach(cell => {
      if (cell.dataset.merged === "true") {
          cell.addEventListener("click", () => {
              document.querySelectorAll(".time-block").forEach(c => c.draggable = false);
              cell.draggable = true;
              cell.ondragstart = dragLesson;
          });
      }
  });
}
function dragLesson(event) {
  let cell = event.target;
  event.dataTransfer.setData("subject", cell.dataset.subject);
  event.dataTransfer.setData("teacher", cell.dataset.teacher);
  event.dataTransfer.setData("colspan", cell.getAttribute("colspan"));
  event.dataTransfer.setData("bgColor", cell.style.backgroundColor);
  event.dataTransfer.setData("oldId", cell.id);
}
function allowDrop(event) {
  event.preventDefault();
}
function dropLesson(event) {
  event.preventDefault();

  let targetCell = event.target.closest(".time-block");
  if (!targetCell || targetCell.innerHTML !== "") return;

  let subject = event.dataTransfer.getData("subject");
  let teacher = event.dataTransfer.getData("teacher");
  let colspan = parseInt(event.dataTransfer.getData("colspan"));
  let bgColor = event.dataTransfer.getData("bgColor");
  let oldId = event.dataTransfer.getData("oldId");

  let targetRow = targetCell.parentElement;
  let targetCells = [...targetRow.children];
  let targetIndex = targetCells.indexOf(targetCell);

  if (targetIndex + colspan > targetCells.length) return;

  let mergedCells = targetCells.slice(targetIndex, targetIndex + colspan);
  if (mergedCells.some(cell => cell.innerHTML !== "")) return;

  let oldCell = document.getElementById(oldId);
  if (oldCell) {
      let oldColspan = parseInt(oldCell.getAttribute("colspan")) || 1;
      let oldRow = oldCell.parentElement;
      let oldCells = [...oldRow.children];
      let oldIndex = oldCells.indexOf(oldCell);
      let oldMergedCells = oldCells.slice(oldIndex, oldIndex + oldColspan);

      oldMergedCells.forEach(cell => {
          cell.innerHTML = "";
          cell.style.backgroundColor = "#fff";
          cell.removeAttribute("colspan");
          cell.dataset.subject = "";
          cell.dataset.teacher = "";
          cell.dataset.merged = "false";
          cell.style.display = "table-cell";
      });
  }
  mergedCells.forEach((cell, index) => {
      if (index === 0) {
          cell.innerHTML = `<strong>${subject}</strong> (${teacher})`;
          cell.style.backgroundColor = bgColor;
          cell.dataset.subject = subject;
          cell.dataset.teacher = teacher;
          cell.dataset.merged = "true";
          cell.setAttribute("colspan", colspan);
          cell.draggable = false;
          cell.addEventListener("click", () => {
              document.querySelectorAll(".time-block").forEach(c => c.draggable = false);
              cell.draggable = true;
              cell.ondragstart = dragLesson;
          });
      } else {
          cell.style.display = "none"; 
      }
  });
}
document.querySelectorAll(".time-block").forEach(cell => {
  cell.ondragover = allowDrop;
  cell.ondrop = dropLesson;
});
showSchedule().then(() => {
    enableCourseDragAndDrop();
});

// Examination Drag And Drop
showExamination().then(() => {
});

// Loading
window.onload = function () {
  loadCourses();
  loadExams();
  loadConflicts();
  showSchedule();
  showExamination();
};
