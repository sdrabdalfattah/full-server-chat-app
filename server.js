const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});






const User = require("./models/user");
const MessageModel = require('./models/chat')


app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// استيراد مسارات الرسائل
const messageRoutes = require("./routes/messageRoutes");
app.use(messageRoutes);

const DB_URI = process.env.MONGO_URI;

mongoose.connect(DB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// تسجيل مستخدم جديد
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const user = new User({ email, name, password });
    await user.save();
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: "Registration error" });
  }
});

// تسجيل الدخول
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(400).json({ error: "Invalid credentials" });

    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: "Login error" });
  }
});

// جلب جميع المستخدمين
app.get("/all_users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const count = users.length;
    res.json({ users, count });
  } catch (e) {
    res.status(500).json({ error: "Failed to get users" });
  }
});


const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("✅ مستخدم متصل:", socket.id);

  socket.on("register_user", async (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("📌 تسجيل المستخدم:", userId, "مع Socket ID:", socket.id);

    await User.updateOne({ _id: userId }, { $set: { online: true } });
    io.emit("update_user_status", { userId, online: true });
  });

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, content } = data;

    try {
      const newMessage = await MessageModel.create({
        sender_id: senderId,
        receiver_id: receiverId,
        message_body: content,
        isRead: false
      });

      const receiverSocketId = onlineUsers[receiverId];
      const senderSocketId = onlineUsers[senderId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", newMessage);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("receive_message", newMessage);
      }
    } catch (error) {
      console.error("❌ حدث خطأ أثناء حفظ الرسالة:", error);
    }
  });




  socket.on("disconnect", async () => {
    let disconnectedUserId = null;

    // البحث عن المستخدم الذي قطع الاتصال
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        disconnectedUserId = userId;
        delete onlineUsers[userId];
        break;
      }
    }

    // إذا تم العثور على المستخدم، نقوم بتحديث حالته في قاعدة البيانات
    if (disconnectedUserId) {
      await User.updateOne({ _id: disconnectedUserId }, { $set: { online: false } });
      console.log("🔴 المستخدم قطع الاتصال:", disconnectedUserId);

      // إرسال تحديث إلى جميع المستخدمين
      io.emit("update_user_status", { userId: disconnectedUserId, online: false });
    }
  });
});



app.delete("/clear-database", async (req, res) => {
  try {
    const { password } = req.query;
    if (password !== process.env.CLEAR_DB_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    await User.deleteMany({});
    await MessageModel.deleteMany({});
    return res.status(200).json({ message: "Database cleared successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/all_messages', async (req, res) => {
  try {
    const messages = await MessageModel.find();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الرسائل" });
  }
});


server.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));







