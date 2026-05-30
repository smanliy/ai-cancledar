const BASE_URL = 'http://localhost:3001/api';

export async function fetchEvents() {
  try {
    const response = await fetch(`${BASE_URL}/events`);
    return await response.json();
  } catch (error) {
    console.error('获取事件失败:', error);
    return [];
  }
}

export async function fetchEventById(id) {
  try {
    const response = await fetch(`${BASE_URL}/events/${id}`);
    if (!response.ok) throw new Error('事件不存在');
    return await response.json();
  } catch (error) {
    console.error('获取事件失败:', error);
    return null;
  }
}

export async function createEvent(eventData) {
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    return await response.json();
  } catch (error) {
    console.error('创建事件失败:', error);
    throw error;
  }
}

export async function updateEvent(id, eventData) {
  try {
    const response = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    return await response.json();
  } catch (error) {
    console.error('更新事件失败:', error);
    throw error;
  }
}

export async function deleteEvent(id) {
  try {
    const response = await fetch(`${BASE_URL}/events/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    console.error('删除事件失败:', error);
    throw error;
  }
}

export async function sendTestEmail(email) {
  try {
    const response = await fetch(`${BASE_URL}/send-test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    return await response.json();
  } catch (error) {
    console.error('发送测试邮件失败:', error);
    throw error;
  }
}

export async function sendReminderEmail(event) {
  try {
    const response = await fetch(`${BASE_URL}/send-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });
    return await response.json();
  } catch (error) {
    console.error('发送提醒邮件失败:', error);
    throw error;
  }
}
