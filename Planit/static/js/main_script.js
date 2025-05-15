function sendMessages() {
    let messageInput = document.getElementById("messageInput");
    let chatBox = document.getElementById("chatBox");
    let messageText = messageInput.value.trim();

    if (messageText === "") return;

    let timeStamp = new Date();
    let formattedTime = timeStamp.getHours() + ":" + timeStamp.getMinutes();
    let formattedDate = timeStamp.getFullYear() + "-" + (timeStamp.getMonth() + 1) + "-" + timeStamp.getDate();

    let sender = studentName || "کاربر ناشناس";

    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "user-message");

    let messageContent = document.createElement("span");
    messageContent.textContent = messageText;

    let messageInfo = document.createElement("div");
    messageInfo.classList.add("message-info");
    messageInfo.textContent = `👤 ${sender}  | 🕒 ${formattedTime}  | 📅 ${formattedDate}`;

    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<img src="../static/media/icons/delete.png" alt="حذف" width="16" height="16">`;
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = function() {
        chatBox.removeChild(messageDiv);
    };

    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(deleteBtn);
    messageDiv.appendChild(messageInfo);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    fetch("/send_messages", {
        method: "POST",
        body: JSON.stringify({
            message: messageText,
            sender: sender  
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json())
      .then(data => {
          if (!data.success) {
              alert("خطا در ذخیره پیام ها");
          } else {
              deleteBtn.onclick = function() {
                  fetch("/delete_message", {
                      method: "POST",
                      body: JSON.stringify({
                          messageId: data.messageId  
                      }),
                      headers: {
                          "Content-Type": "application/json"
                      }
                  }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            chatBox.removeChild(messageDiv);  
                        } else {
                            alert("خطا در حذف پیام: " + data.error);
                        }
                    })
                    .catch(error => {
                        console.error("خطا در ارسال درخواست حذف پیام:", error);
                        alert("خطا در حذف پیام.");
                    });
              };
          }
      });

    messageInput.value = "";
}

function getMessages() {
    fetch("/get_messages")
        .then(response => response.json())
        .then(messages => {
            let chatBox = document.getElementById("chatBox");
            chatBox.innerHTML = "";

            messages.forEach(msg => {
                let messageDiv = document.createElement("div");
                messageDiv.classList.add("message", "user-message");

                let messageContent = document.createElement("span");
                messageContent.textContent = msg.message;

                let messageInfo = document.createElement("div");
                messageInfo.classList.add("message-info");
                messageInfo.textContent = `👤 ${msg.sender}  | 🕒 ${msg.time}  | 📅 ${msg.date}`;

                let deleteBtn = null;
                if (msg.sender === studentName) {
                    deleteBtn = document.createElement("button");
                    deleteBtn.innerHTML = `<img src="../static/media/icons/delete.png" alt="حذف" width="16" height="16">`;
                    deleteBtn.classList.add("delete-btn");
                    deleteBtn.onclick = function() {
                        fetch("/delete_message", {
                            method: "POST",
                            body: JSON.stringify({
                                messageId: msg.id 
                            }),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }).then(response => response.json())
                          .then(data => {
                              if (data.success) {
                                  chatBox.removeChild(messageDiv); 
                              } else {
                                  alert("خطا در حذف پیام: " + data.error);
                              }
                          })
                          .catch(error => {
                              console.error("خطا در ارسال درخواست حذف پیام:", error);
                              alert("خطا در حذف پیام.");
                          });
                    };
                }

                messageDiv.appendChild(messageContent);
                if (deleteBtn) {
                    messageDiv.appendChild(deleteBtn);
                }
                messageDiv.appendChild(messageInfo);

                chatBox.appendChild(messageDiv);
            });

            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            console.error("خطا در دریافت پیام‌ها:", error);
        });
}

async function showSchedule() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/schedule"); 
        const data = await response.json();
  
        // پاک کردن محتوای قبلی جدول
        document.querySelectorAll(".time-block").forEach(cell => {
            cell.innerHTML = "";
            cell.style.backgroundColor = "#fff";
        });
  
        data.forEach(item => {
            let dayIndex = days.indexOf(item.day);
            let groupIndex = groups.indexOf(item.year.toString());
  
            if (dayIndex !== -1 && groupIndex !== -1) {
                let startHour = Math.floor(item.start);
                let startMin = item.start % 1 === 0 ? "00" : "30";
                let endHour = Math.floor(item.end);
                let endMin = item.end % 1 === 0 ? "00" : "30";
  
                for (let i = item.start; i < item.end; i += 0.5) {
                    let blockStartHour = Math.floor(i);
                    let blockStartMin = i % 1 === 0 ? "00" : "30";
                    let blockEndHour = blockStartMin === "00" ? blockStartHour : blockStartHour + 1;
                    let blockEndMin = blockStartMin === "00" ? "30" : "00";
  
                    let cellId = `day${dayIndex}-group${groupIndex}-${blockStartHour}:${blockStartMin}-${blockEndHour}:${blockEndMin}`;
                    let cell = document.getElementById(cellId);
  
                    if (cell) {
                        cell.innerHTML = `${item.subject} <br> (${item.teacher})`;
                        cell.style.backgroundColor = "#d1f0ff"; 
                    }
                }
            }
        });
    } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
    }
}

window.onload = function () {
    getMessages();
    showSchedule();
};
