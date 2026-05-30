const CATEGORY_KEYWORDS = {
  work: ['工作', '会议', '开会', '报告', '演讲', '商务'],
  life: ['生日', '纪念日', '聚会', '约会', '家人'],
  health: ['健身', '运动', '跑步', '瑜伽', '体检', '医院'],
  social: ['朋友', '聚餐', '社交', '约会', '派对']
}

const TIME_PATTERNS = [
  { pattern: /(\d+)分钟(?:后|以后)/i, type: 'relative', unit: 'minute' },
  { pattern: /(\d+)小时(?:后|以后)/i, type: 'relative', unit: 'hour' },
  { pattern: /(\d+)天(?:后|以后)/i, type: 'relative', unit: 'day' },
  { pattern: /今天(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'today' },
  { pattern: /明天(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'tomorrow' },
  { pattern: /后天(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'dayAfter' },
  { pattern: /下周一(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'nextMonday' },
  { pattern: /下周二(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'nextTuesday' },
  { pattern: /下周三(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'nextWednesday' },
  { pattern: /下周四(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'nextThursday' },
  { pattern: /下周五(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'nextFriday' },
  { pattern: /下周六(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'nextSaturday' },
  { pattern: /下周日(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'nextSunday' },
  { pattern: /(\d+)月(\d+)日(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'monthDay' },
  { pattern: /(\d+)日(?:上午|下午|晚上)?(\d+)?[点时](?:(\d+)分)?/i, type: 'dayOfMonth' }
]

const ACTION_PATTERNS = {
  create: [/添加/i, /创建/i, /新建/i, /记一下/i, /提醒我/i, /新增/i],
  delete: [/删除/i, /去掉/i, /取消/i],
  update: [/改到/i, /改成/i, /改到/i, /修改/i, /更新/i],
  query: [/查看/i, /看看/i, /有什么/i, /查看/i, /显示/i]
}

export function parseVoiceCommand(text) {
  const result = {
    raw: text,
    action: null,
    entities: {
      title: null,
      date: null,
      time: null,
      category: null,
      duration: null
    },
    confidence: 0.8
  }

  for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(text))) {
      result.action = action
      break
    }
  }

  if (!result.action) {
    result.action = 'create'
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      result.entities.category = category
      break
    }
  }

  for (const { pattern, type } of TIME_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      result.entities.date = type
      if (match[1]) {
        result.entities.time = {
          hour: parseInt(match[1]),
          minute: match[2] ? parseInt(match[2]) : 0
        }
      }
      break
    }
  }

  const titleMatch = text.match(/([^于到在把].*?)(?:在|于|提醒|$)/)
  if (titleMatch) {
    result.entities.title = titleMatch[1].trim()
  }

  return result
}

export function resolveEventFromCommand(command, baseDate = new Date()) {
  const event = {
    title: command.entities.title || '新事件',
    startTime: new Date(),
    endTime: new Date(),
    isAllDay: false,
    category: command.entities.category || 'life',
    reminder: 15,
    repeat: 'none',
    note: ''
  }

  if (!command.entities.date) {
    event.startTime = new Date(baseDate)
    event.endTime = new Date(baseDate)
    event.isAllDay = true
    return event
  }

  const now = new Date(baseDate)

  switch (command.entities.date) {
    case 'today':
      event.startTime = now
      event.endTime = new Date(now.getTime() + 60 * 60 * 1000)
      break
    case 'tomorrow':
      event.startTime = new Date(now.setDate(now.getDate() + 1))
      event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
      break
    case 'dayAfter':
      event.startTime = new Date(now.setDate(now.getDate() + 2))
      event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
      break
    case 'nextMonday':
    case 'nextTuesday':
    case 'nextWednesday':
    case 'nextThursday':
    case 'nextFriday':
    case 'nextSaturday':
    case 'nextSunday':
      const dayMap = {
        nextMonday: 1, nextTuesday: 2, nextWednesday: 3,
        nextThursday: 4, nextFriday: 5, nextSaturday: 6, nextSunday: 0
      }
      const targetDay = dayMap[command.entities.date]
      const currentDay = now.getDay()
      let daysUntil = targetDay - currentDay
      if (daysUntil <= 0) daysUntil += 7
      event.startTime = new Date(now.setDate(now.getDate() + daysUntil))
      event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
      break
    case 'monthDay':
      const month = parseInt(command.entities.time?.hour || now.getMonth() + 1) - 1
      const day = parseInt(command.entities.time?.minute || now.getDate())
      event.startTime = new Date(now.getFullYear(), month, day)
      event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
      break
    case 'dayOfMonth':
      event.startTime = new Date(now.getFullYear(), now.getMonth(), parseInt(command.entities.time?.hour || now.getDate()))
      event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
      break
    default:
      event.startTime = now
      event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
  }

  if (command.entities.time) {
    event.startTime.setHours(command.entities.time.hour, command.entities.time.minute || 0, 0, 0)
    event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
  }

  return event
}

export function formatEventForSpeech(event) {
  const dateStr = event.startTime.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'long'
  })
  const timeStr = event.isAllDay
    ? '全天'
    : event.startTime.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: '2-digit' })

  return `已添加：${event.title}，${dateStr}，${timeStr}`
}