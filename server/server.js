import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import schedule from 'node-schedule';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const events = [];
const scheduledJobs = {};

let transporter = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: process.env.EMAIL_USER || 'your-qq-email@qq.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});

async function sendReminderEmail(event) {
  if (!event.reminderEmail) return;

  const eventTime = new Date(event.startTime);
  const formattedTime = event.isAllDay
    ? eventTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
    : eventTime.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

  const mailOptions = {
    from: `"AI日历" <${process.env.EMAIL_USER}>`,
    to: event.reminderEmail,
    subject: `⏰ 事件提醒: ${event.title}`,
    text: `您好！\n\n您设置的事件即将开始：\n\n📋 事件名称：${event.title}\n📅 时间：${formattedTime}\n🏷️ 分类：${getCategoryLabel(event.category)}\n\n${event.note ? `📝 备注：${event.note}\n\n` : ''}请提前做好准备！`,
    html: `
      <div style="font-family: 'Microsoft YaHei', sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fff8e7 0%, #ffe4c4 100%); border-radius: 16px; border: 3px solid #d4a574;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 48px;">📅</span>
        </div>
        <h2 style="color: #8b6914; margin: 0 0 15px; font-size: 20px;">事件提醒</h2>
        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px dashed #d4a574;">
          <p style="margin: 8px 0;"><strong>📋 事件名称：</strong>${event.title}</p>
          <p style="margin: 8px 0;"><strong>📅 时间：</strong>${formattedTime}</p>
          <p style="margin: 8px 0;"><strong>🏷️ 分类：</strong>${getCategoryLabel(event.category)}</p>
          ${event.note ? `<p style="margin: 8px 0;"><strong>📝 备注：</strong>${event.note}</p>` : ''}
        </div>
        <p style="color: #8b7355; font-size: 14px; margin-top: 15px; text-align: center;">请提前做好准备！</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', info.messageId);
    return info;
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }
}

function getCategoryLabel(category) {
  const labels = {
    work: '💼 工作',
    life: '🏠 生活',
    health: '💊 健康',
    social: '👥 社交'
  };
  return labels[category] || category;
}

function scheduleReminderForEvent(event) {
  if (!event.reminderEmail) return;

  const eventTime = new Date(event.startTime);
  const reminderTime = new Date(eventTime.getTime() - (event.reminder || 5) * 60 * 1000);
  const now = new Date();

  if (reminderTime <= now) {
    console.log(`事件 ${event.title} 的提醒时间已过，立即发送提醒`);
    sendReminderEmail(event);
    return;
  }

  if (scheduledJobs[event.id]) {
    scheduledJobs[event.id].cancel();
    console.log(`已取消旧的提醒任务: ${event.title}`);
  }

  const job = schedule.scheduleJob(reminderTime, () => {
    sendReminderEmail(event);
    console.log(`已发送提醒邮件: ${event.title}`);
    delete scheduledJobs[event.id];
  });

  scheduledJobs[event.id] = job;
  console.log(`已安排提醒: ${event.title} 在 ${reminderTime}`);
}

function scheduleAllReminders() {
  Object.keys(scheduledJobs).forEach(jobId => {
    scheduledJobs[jobId].cancel();
    delete scheduledJobs[jobId];
  });

  events.forEach(event => {
    if (event.reminderEmail) {
      scheduleReminderForEvent(event);
    }
  });
}

app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: '事件不存在' });
  }
});

app.post('/api/events', (req, res) => {
  const newEvent = {
    id: Date.now().toString(),
    ...req.body,
    startTime: new Date(req.body.startTime).toISOString(),
    endTime: req.body.endTime ? new Date(req.body.endTime).toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  events.push(newEvent);

  if (newEvent.reminderEmail) {
    scheduleReminderForEvent(newEvent);
  }

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    const updatedEvent = {
      ...events[index],
      ...req.body,
      startTime: req.body.startTime ? new Date(req.body.startTime).toISOString() : events[index].startTime,
      endTime: req.body.endTime ? new Date(req.body.endTime).toISOString() : events[index].endTime,
      updatedAt: new Date().toISOString()
    };
    events[index] = updatedEvent;

    if (updatedEvent.reminderEmail) {
      scheduleReminderForEvent(updatedEvent);
    } else if (scheduledJobs[updatedEvent.id]) {
      scheduledJobs[updatedEvent.id].cancel();
      delete scheduledJobs[updatedEvent.id];
    }

    res.json(updatedEvent);
  } else {
    res.status(404).json({ error: '事件不存在' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    if (scheduledJobs[req.params.id]) {
      scheduledJobs[req.params.id].cancel();
      delete scheduledJobs[req.params.id];
    }
    events.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: '事件不存在' });
  }
});

app.post('/api/send-test-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: '请提供邮箱地址' });
  }

  const testEvent = {
    id: 'test',
    title: '测试提醒',
    startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    isAllDay: false,
    category: 'life',
    reminder: 5,
    reminderEmail: email,
    note: '这是一封测试邮件，用于验证邮箱提醒功能是否正常工作。'
  };

  try {
    const result = await sendReminderEmail(testEvent);
    res.json({ success: true, message: '测试邮件已发送', messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-reminder', async (req, res) => {
  const event = req.body;

  if (!event.reminderEmail) {
    return res.status(400).json({ error: '请提供提醒邮箱地址' });
  }

  try {
    const result = await sendReminderEmail(event);
    res.json({ success: true, message: '提醒邮件已发送', messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/jobs', (req, res) => {
  res.json({
    scheduledJobs: Object.keys(scheduledJobs).length,
    eventsWithReminders: events.filter(e => e.reminderEmail).length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});
