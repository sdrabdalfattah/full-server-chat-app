const express = require('express');
const router = express.Router();

const cors = require('cors');

router.use(cors());
router.use(express.json());

// جلب جميع الرسائل بين مستخدمين
const Message = require('../models/chat'); // تأكد من مسار ملف الموديل

router.get('/messages/:sender_id/:receiver_id', async (req, res) => {
  const { sender_id, receiver_id } = req.params;

  if (!sender_id || !receiver_id) {
    return res.status(400).json({ success: false, error: 'sender_id و receiver_id مطلوبان' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender_id: sender_id, receiver_id: receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id }
      ]
    }).sort({ timestamp: 1 }); // ترتيب تصاعدي حسب الوقت

    res.status(200).json({ success: true, messages });

  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'فشل في جلب الرسائل' });
  }
});



// حذف جميع الرسائل بين مستخدمين
router.delete('/delete_chat/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    await Message.deleteMany({
      $or: [
        { sender_id: user1, receiver_id: user2 },
        { sender_id: user2, receiver_id: user1 }
      ]
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "فشل في حذف المحادثة" });
  }
});

module.exports = router;