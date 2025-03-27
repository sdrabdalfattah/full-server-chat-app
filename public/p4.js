


function showLoader() {
  let loader = document.getElementById("loader");
  loader.classList.add("show_load"); // إظهار اللودر
}

function hideLoader() {
  let loader = document.getElementById("loader");
  loader.classList.remove("show_load"); // إخفاء اللودر
}


// succses message ====================================================================
function showNotification(message, isSuccess = true) {
let notification = document.createElement("div");
notification.className = `al_mokbir ${isSuccess ? 'success' : 'error'}`;
notification.innerHTML = `${message} <div class="close-btn"><i class="fa-solid fa-arrow-down"></i></div>`;
document.body.appendChild(notification);
setTimeout(() => {
notification.classList.add("show");
}, 10);
let close_notefecation_button = notification.querySelector(".close-btn")
close_notefecation_button.addEventListener("click", function () {
notification.classList.remove("show");
setTimeout(() => notification.remove(), 500);
});
setTimeout(() => {
notification.classList.remove("show");
setTimeout(() => notification.remove(), 500);
}, 4000);
}



// show loader - notefecation ===================================================================
let login_container = document.getElementById('login_container');
let register_container = document.getElementById('register_container');
let login_btn = document.getElementById('login_btn');




// إظهار تسجيل الدخول
function show_signing_windows() {
    login_container.style.bottom = '40px';
}

// إظهار التسجيل
function show_regist() {
    login_container.style.bottom = '-520px';
    register_container.style.bottom = '40px';
}

// العودة لتسجيل الدخول
function show_login() {
    login_container.style.bottom = '40px';
    register_container.style.bottom = '-520px';
}




let big_users_container =document.getElementById('big_users_container')
function show_users_list() {
  big_users_container.style.left ='0px'
  big_users_container.style.width ='100%'
}

function hide_users_list() {
  big_users_container.style.left ='-30px'
  big_users_container.style.width ='0%'
}

// ----------------------------------register-------------------------------------
function register() {
  showLoader()
  console.log('register');
  let username = document.getElementById("username").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let regist_params = {
      "email": email,
      "name": username,
      "password": password
  };

  axios.post('https://full-server-chat-app.onrender.com/register', regist_params, {
      headers: { 'Content-Type': 'application/json' }
  })
  .then(function (response) {
      let user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('successMessage', "Registration successful!"); // تخزين الرسالة
      window.location.href = 'home.html';
      hideLoader()
  })
  .catch(function (error) {
      showNotification("Registration failed!", false);
      console.log(error)
      hideLoader()
  });
}

function login() {
  showLoader()
  let login_email = document.getElementById("login_email").value;
  let login_password = document.getElementById("login_password").value;

  let login_params = {
      "email": login_email,
      "password": login_password
  };

  axios.post('https://full-server-chat-app.onrender.com/login', login_params)
      .then(function (response) {
        hideLoader()
          let user = response.data.user;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('successMessage', "Logged in successfully!"); // تخزين الرسالة
          window.location.href = 'home.html';
      })
      .catch(function (error) {
          console.log(error);
          showNotification("Login failed!", false);
          hideLoader()
      });
}


window.onload = function() {
  let successMessage = localStorage.getItem('successMessage');
  if (successMessage) {
      showNotification(successMessage, true);
      localStorage.removeItem('successMessage'); // مسح الرسالة بعد عرضها
  }
};




function no_scrolling_down() {
    const messeges_container = document.getElementById('messeges_container');
    if (messeges_container) {
      messeges_container.scrollTop = messeges_container.scrollHeight;
    }
  }
  


let socket;
let selectedUserId = null
let unreadMessagesCount = {};

let username = JSON.parse(localStorage.getItem('user')).name;
document.getElementById('user_name').innerHTML = `<i class="fa-solid fa-user"></i> ${username} <span class="you_span" style="color: gray;">(YOU)</span>`;

// الاتصال بـ Socket.IO
const user = JSON.parse(localStorage.getItem('user'));

    const socket = io("https://full-server-chat-app.onrender.com", {
  withCredentials: true,
  transports: ["websocket", "polling"]
});

    socket.on("connect", () => {
        const currentUserId = JSON.parse(localStorage.getItem("user")).id;
        socket.emit("register_user", currentUserId);
      });
      
      




      function all_users() {
        showLoader();
        axios.get("https://full-server-chat-app.onrender.com")
          .then(response => {
            const users = response.data.users;
            const count = response.data.count;
            hideLoader();
            document.getElementById("all_users_title").innerHTML = `<i class="fa-solid fa-users"></i> All Users (${count})`;
            const container = document.getElementById("users_container");
            container.innerHTML = "";
      
            users.forEach(user => {
              if (user._id === JSON.parse(localStorage.getItem("user")).id) return;
      
              const userDiv = document.createElement("div");
              userDiv.classList.add("user_container");
              userDiv.setAttribute("data-user-id", user._id);
      
              userDiv.innerHTML = `
                <h2 style="display:flex; align-items:center; gap: 8px; position: relative;">
                  <i class="fa-solid fa-user"></i> 
                  <div class="connection_circle" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${user.online ? "green" : "gray"};"></div>
                  ${user.name}
                </h2>
                <div class="unread_badge" style="display:none;">0</div>
              `;
      
              function get_user(user) {
                showLoader();
                selectedUserId = user._id;
                const sender_id = JSON.parse(localStorage.getItem("user")).id;
              
                axios.get(`https://full-server-chat-app.onrender.com/messages/${sender_id}/${selectedUserId}`)
                  .then(response => {
                    (() => {
                      if (window.innerWidth < 1200) {
                        hide_users_list();
                      }
                    })();
              
                    hideLoader();
                    document.getElementById('texting_container').style.display = "flex";
                    const messages = response.data.messages;
                    
                    // 📌 طباعة جميع الرسائل غير المقروءة في الـ console قبل تحديثها
                    const unreadMessages = messages.filter(msg => !msg.isRead);
                    if (unreadMessages.length > 0) {
                      console.log(`📩 لديك ${unreadMessages.length} رسائل غير مقروءة مع ${user.name}:`);
                      unreadMessages.forEach(msg => {
                        console.log(`🔹 الرسالة: "${msg.message_body}" | ⏳ الحالة: غير مقروءة`);
                      });
              
                      // ✅ إرسال طلب عبر Socket.IO لتحديث جميع الرسائل إلى مقروءة
                      socket.emit("mark_all_as_read", { senderId: selectedUserId, receiverId: sender_id });
                    }
              
                    document.getElementById("messages_header").innerHTML = `
                      <span class="users_list" onclick="show_users_list()">
                        <i class="fa-solid fa-list-ul"></i>
                      </span> 
                      Private chat with ${user.name} 
                      <i class="fa-solid fa-lock"></i>
                      <div class="trash_can" onclick="delete_chat()">
                        <i class="fa-solid fa-trash"></i>
                      </div>`;
              
                    const messeges_container = document.getElementById("messeges_container");
                    messeges_container.innerHTML = "";
              
                    const currentUserId = JSON.parse(localStorage.getItem("user")).id;
                    messages.forEach(msg => {
                      const formattedTime = new Date(msg.timestamp).toLocaleString();
                      const isMyMessage = msg.sender_id === currentUserId;
                      const containerClass = isMyMessage ? "message_container my_message_container" : "message_container notmy_message_container";
                      const bodyClass = isMyMessage ? "message_body_container my_message_body_container" : "message_body_container notmy_message_body_container";
              
                      const messageHTML = `
                        <div class="${containerClass}">
                            <h1 class="${bodyClass}">${msg.message_body}</h1>
                            <h2 class="my_is_read">
                            ${formattedTime}
                            </h2>
                        </div>
                      `;
                      messeges_container.innerHTML += messageHTML;
                    });
              
                    unreadMessagesCount[selectedUserId] = 0;
                    const userDiv = document.querySelector(`[data-user-id="${selectedUserId}"]`);
                    if (userDiv) {
                      const badge = userDiv.querySelector(".unread_badge");
                      if (badge) badge.style.display = "none";
                    }
              
                    no_scrolling_down();
                  })
                  .catch(error => {
                    console.error("❌ فشل في جلب الرسائل:", error);
                    hideLoader();
                  });
              }
              
              // ✅ استقبال تأكيد من الخادم بأن جميع الرسائل قد تم وضعها كمقروءة
              socket.on("messages_marked_as_read", ({ receiverId }) => {
                if (receiverId === selectedUserId) {
                  console.log(`✅ تم وضع جميع الرسائل مع المستخدم ${receiverId} كمقروءة.`);
                }
              });
              
      
              userDiv.onclick = () => { get_user(user); };
              container.appendChild(userDiv);
            });
          })
          .catch(error => {
            hideLoader();
            console.log("❌ حدث خطأ أثناء جلب المستخدمين:", error);
          });
      }
      
      all_users();
      

      
      socket.on("update_user_status", ({ userId, online }) => {
        const userDiv = document.querySelector(`[data-user-id="${userId}"]`);
        if (userDiv) {
          const statusCircle = userDiv.querySelector(".connection_circle");
          if (statusCircle) {
            statusCircle.style.backgroundColor = online ? "green" : "gray";
          }
        }
      });
      

    

function sendMessage() {
    const messageInput = document.getElementById("message_body");
    const message = messageInput.value.trim();
    let myId = JSON.parse(localStorage.getItem('user')).id
    console.log(messageInput , message , myId , selectedUserId);

    if (message !== "") {
      // إرسال الرسالة إلى السيرفر
      socket.emit("send_message", {
        senderId: myId,      // ضع معرف المرسل هنا
        receiverId: selectedUserId, // ضع معرف المستقبل هنا
        content: message
      });

      messageInput.value = "";
      let sendBTN = document.getElementById('sendBTN')
      sendBTN.style.backgroundColor = "rgb(51, 51, 51)"
      sendBTN.style.border = "3px solid rgb(116, 116, 116)"
      sendBTN.style.opacity = "0.5";
      console.log('sended sucsesfully !')
    }
  
}





const messageInput = document.getElementById("message_body");

messageInput.onkeyup = function () {
let sendBTN = document.getElementById('sendBTN')
if(messageInput.value !== "") {
  sendBTN.style.backgroundColor = "rgb(51, 91, 124)"
  sendBTN.style.border = "3px solid rgb(0, 140, 255)"
  sendBTN.style.opacity = "1";
 }
 else{
  sendBTN.style.backgroundColor = "rgb(51, 51, 51)"
  sendBTN.style.border = "3px solid rgb(116, 116, 116)"
  sendBTN.style.opacity = "0.5";
 }
}




function get_message() {
    socket.on("receive_message", (msg) => {
        const currentUserId = JSON.parse(localStorage.getItem('user')).id;
        const formattedTime = new Date(msg.timestamp).toLocaleString();
        const isMyMessage = msg.sender_id === currentUserId;
        const containerClass = isMyMessage ? "message_container my_message_container" : "message_container notmy_message_container";
        const bodyClass = isMyMessage ? "message_body_container my_message_body_container" : "message_body_container notmy_message_body_container";
      
        const messageHTML = `
          <div class="${containerClass}">
              <h1 class="${bodyClass}">${msg.message_body}</h1>
              <h2 class="my_is_read">${msg.isRead ? '<span> read <i style="color:rgb(46, 161, 255);" class="fa-solid fa-check"></i></span>' : 'Not read <i class="fa-solid fa-clock"></i>'} - ${formattedTime}</h2>
          </div>
        `;
      
        // إذا كانت المحادثة مفتوحة مع نفس المستخدم، اعرض الرسالة مباشرة
        if (selectedUserId === msg.sender_id || isMyMessage) {
          document.getElementById('messeges_container').innerHTML += messageHTML;
          no_scrolling_down();
        } else {
          // إذا كانت المحادثة غير مفتوحة مع المرسل
          unreadMessagesCount[msg.sender_id] = (unreadMessagesCount[msg.sender_id] || 0) + 1;
          updateUnreadBadge(msg.sender_id);
        }
      });
      
      
  }
  get_message(); 

  


  function updateUnreadBadge(userId) {
    const userDiv = document.querySelector(`[data-user-id="${userId}"]`);
    if (userDiv) {
      let badge = userDiv.querySelector(".unread_badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.classList.add("unread_badge");
        userDiv.appendChild(badge);
      }
      badge.textContent = unreadMessagesCount[userId];
      badge.style.display = 'flex';
    }
  }
  





  function delete_chat() {  
    const sender_id = JSON.parse(localStorage.getItem('user'))?.id;
    showLoader();
    axios.delete(`https://full-server-chat-app.onrender.com/delete_chat/${sender_id}/${selectedUserId}`)
      .then(response => {
        hideLoader();
        showNotification("Chat deleted successfully!", true);
      })
      .catch(error => {
        hideLoader();
        showNotification("Something went wrong!", false);
      });
}

  
  





function logout() {
  localStorage.removeItem('user');
  localStorage.setItem('successMessage', "Logged out successfully!"); // تخزين الرسالة
  window.location.href = 'login.html';
}










