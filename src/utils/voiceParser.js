const CATEGORY_KEYWORDS = {
  work: ['工作', '会议', '开会', '报告', '演讲', '商务', '项目', '汇报', '面试'],
  life: ['生日', '纪念日', '聚会', '约会', '家人', '购物', '吃饭', '电影'],
  health: ['健身', '运动', '跑步', '瑜伽', '体检', '医院', '锻炼', '减肥'],
  social: ['朋友', '聚餐', '社交', '派对', '同学', '同事', '拜访']
}

const FUZZY_TIME_WORDS = {
  '一会': { minutes: 10 },
  '一会儿': { minutes: 10 },
  '过一会': { minutes: 15 },
  '过一会儿': { minutes: 15 },
  '马上': { minutes: 5 },
  '立刻': { minutes: 5 },
  '马上就': { minutes: 5 },
  '稍后': { minutes: 15 },
  '等会儿': { minutes: 10 },
  '等一下': { minutes: 5 },
  '不久': { minutes: 20 },
  '很快': { minutes: 8 },
  '马上到': { minutes: 3 },
  '稍等': { minutes: 5 },
  '稍后提醒': { minutes: 15 },
  '等会儿提醒': { minutes: 10 }
}

const TIME_PERIODS = {
  '早上': { hour: 7 },
  '早晨': { hour: 7 },
  '上午': { hour: 9 },
  '中午': { hour: 12 },
  '午休': { hour: 12 },
  '下午': { hour: 14 },
  '傍晚': { hour: 18 },
  '晚上': { hour: 20 },
  '夜里': { hour: 22 },
  '深夜': { hour: 23 },
  '凌晨': { hour: 2 }
}

const REMINDER_PATTERNS = [
  { pattern: /提前(\d+)分钟提醒/i, valueIndex: 1, unit: 'minute' },
  { pattern: /提前(\d+)分提醒/i, valueIndex: 1, unit: 'minute' },
  { pattern: /提前(\d+)小时提醒/i, valueIndex: 1, unit: 'hour' },
  { pattern: /提前半小时提醒/i, value: 30, unit: 'minute' },
  { pattern: /提前一小时提醒/i, value: 60, unit: 'minute' },
  { pattern: /(\d+)分钟前提醒/i, valueIndex: 1, unit: 'minute' },
  { pattern: /(\d+)分钟提醒/i, valueIndex: 1, unit: 'minute' },
  { pattern: /30分钟提醒/i, value: 30, unit: 'minute' },
  { pattern: /半小时提醒/i, value: 30, unit: 'minute' }
]

const RELATIVE_TIME_PATTERNS = [
  { pattern: /(\d+)分钟(?:后|以后)?/i, type: 'relative', unit: 'minute' },
  { pattern: /(\d+)分(?:钟)?(?:后|以后)?/i, type: 'relative', unit: 'minute' },
  { pattern: /半小时(?:后|以后)?/i, type: 'relative', unit: 'minute', value: 30 },
  { pattern: /(\d+)小时(?:后|以后)?/i, type: 'relative', unit: 'hour' },
  { pattern: /(\d+)个小时(?:后|以后)?/i, type: 'relative', unit: 'hour' },
  { pattern: /(\d+)天(?:后|以后)?/i, type: 'relative', unit: 'day' },
  { pattern: /(\d+)天后(?:再说)?/i, type: 'relative', unit: 'day' },
  { pattern: /大后天/i, type: 'relative', unit: 'day', value: 3 },
  { pattern: /前天/i, type: 'relative', unit: 'day', value: -2 },
  { pattern: /昨天/i, type: 'relative', unit: 'day', value: -1 }
]

const ABSOLUTE_TIME_PATTERNS = [
  { pattern: /今天(?:的)?(早上|早晨|上午|中午|下午|傍晚|晚上|夜里|深夜|凌晨)?(\d+)?[点时](?:(\d+)分)?/i, type: 'today' },
  { pattern: /明天(?:的)?(早上|早晨|上午|中午|下午|傍晚|晚上|夜里|深夜|凌晨)?(\d+)?[点时](?:(\d+)分)?/i, type: 'tomorrow' },
  { pattern: /后天(?:的)?(早上|早晨|上午|中午|下午|傍晚|晚上|夜里|深夜|凌晨)?(\d+)?[点时](?:(\d+)分)?/i, type: 'dayAfter' },
  { pattern: /本周(?:的)?(一|二|三|四|五|六|日|一到五)?/i, type: 'thisWeek' },
  { pattern: /下周(?:的)?(一|二|三|四|五|六|日)?/i, type: 'nextWeek' },
  { pattern: /(\d+)月(\d+)日(?:的)?(早上|早晨|上午|中午|下午|傍晚|晚上|夜里|深夜|凌晨)?(\d+)?[点时](?:(\d+)分)?/i, type: 'monthDay' },
  { pattern: /(\d+)号(?:的)?(早上|早晨|上午|中午|下午|傍晚|晚上|夜里|深夜|凌晨)?(\d+)?[点时](?:(\d+)分)?/i, type: 'dayOfMonth' },
  { pattern: /(\d+)点(?:(\d+)分)?/i, type: 'todayTime' },
  { pattern: /(\d+)点半/i, type: 'todayTime', isHalf: true },
  { pattern: /(\d+)时(?:(\d+)分)?/i, type: 'todayTime' },
  { pattern: /(早上|早晨|上午|中午|下午|傍晚|晚上|夜里|深夜|凌晨)(\d+)?[点时]?(?:(\d+)分)?/i, type: 'periodTime' }
]

const ACTION_PATTERNS = {
  create: [/添加/i, /创建/i, /新建/i, /记一下/i, /提醒我/i, /新增/i, /设置提醒/i, /帮我记/i, /我要/i, /安排/i],
  delete: [/删除/i, /去掉/i, /取消/i, /移除/i, /删掉/i, /不要/i],
  update: [/改到/i, /改成/i, /改到/i, /修改/i, /更新/i, /调整/i],
  query: [/查看/i, /看看/i, /有什么/i, /显示/i, /查一下/i, /什么安排/i]
}

function extractFuzzyTime(text) {
  for (const [word, value] of Object.entries(FUZZY_TIME_WORDS)) {
    if (text.includes(word)) {
      return { type: 'fuzzy', ...value }
    }
  }
  return null
}

function extractReminderMinutes(text) {
  for (const { pattern, valueIndex, unit, value } of REMINDER_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      let reminderValue = value || parseInt(match[valueIndex])
      if (unit === 'hour') {
        reminderValue *= 60
      }
      return reminderValue
    }
  }
  return null
}

function extractRelativeTime(text) {
  for (const { pattern, type, unit, value } of RELATIVE_TIME_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      return {
        type: type,
        unit: unit,
        value: value || parseInt(match[1])
      }
    }
  }
  return null
}

function extractAbsoluteTime(text) {
  for (const { pattern, type, isHalf } of ABSOLUTE_TIME_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const result = { type: type }

      if (match[1]) {
        if (TIME_PERIODS[match[1]]) {
          result.period = match[1]
          result.hour = TIME_PERIODS[match[1]].hour
          if (match[2]) {
            result.hour = parseInt(match[2])
            if (result.period === '下午' && result.hour < 12) {
              result.hour += 12
            } else if (result.period === '晚上' && result.hour <= 12) {
              result.hour += 12
            }
          }
          result.minute = match[3] ? parseInt(match[3]) : 0
        } else if (!isNaN(parseInt(match[1]))) {
          result.hour = parseInt(match[1])
          result.minute = isHalf ? 30 : (match[2] ? parseInt(match[2]) : 0)
        } else {
          result.dayOfWeek = match[1]
        }
      }

      if (match[2] && !result.hour && !isNaN(parseInt(match[2]))) {
        result.hour = parseInt(match[2])
        result.minute = match[3] ? parseInt(match[3]) : 0
      } else if (match[3] && !result.minute && !isNaN(parseInt(match[3]))) {
        result.minute = parseInt(match[3])
      }

      if (match[4] && !result.hour && !isNaN(parseInt(match[4]))) {
        let h = parseInt(match[4])
        if (result.period === '下午' && h < 12) h += 12
        else if (result.period === '晚上' && h <= 12) h += 12
        result.hour = h
        result.minute = match[5] ? parseInt(match[5]) : 0
      }

      return result
    }
  }
  return null
}

function cleanTitle(text) {
  let cleaned = text;

  const chineseNumbers = '[零一二三四五六七八九十百千万]';

  const timePatterns = [
    new RegExp(`提前${chineseNumbers}+分钟提醒`, 'gi'),
    new RegExp(`提前${chineseNumbers}+分提醒`, 'gi'),
    new RegExp(`提前${chineseNumbers}+小时提醒`, 'gi'),
    /提前半小时提醒/gi,
    /提前一小时提醒/gi,
    new RegExp(`${chineseNumbers}+分钟前提醒`, 'gi'),
    new RegExp(`${chineseNumbers}+分钟提醒`, 'gi'),
    /半小时提醒/gi,
    new RegExp(`${chineseNumbers}+分钟(?:后|以后)?`, 'gi'),
    /\d+分钟(?:后|以后)?/gi,
    /分钟(?:后|以后)/gi,
    new RegExp(`${chineseNumbers}+分(?:钟)?(?:后|以后)?`, 'gi'),
    /\d+分(?:钟)?(?:后|以后)?/gi,
    /分(?:钟)?(?:后|以后)/gi,
    /半小时(?:后|以后)?/gi,
    new RegExp(`${chineseNumbers}+小时(?:后|以后)`, 'gi'),
    /\d+小时(?:后|以后)/gi,
    /小时(?:后|以后)/gi,
    new RegExp(`${chineseNumbers}+个小时(?:后|以后)?`, 'gi'),
    /\d+个小时(?:后|以后)?/gi,
    /个小时(?:后|以后)/gi,
    new RegExp(`${chineseNumbers}+天(?:后|以后)?`, 'gi'),
    /\d+天(?:后|以后)?/gi,
    /天(?:后|以后)/gi,
    new RegExp(`${chineseNumbers}+天后`, 'gi'),
    /\d+天后/gi,
    /大后天/gi,
    /前天/gi,
    /昨天/gi,
    /今天/gi,
    /明天/gi,
    /后天/gi,
    new RegExp(`早上${chineseNumbers}+点`, 'gi'),
    /早上\d+点/gi,
    /早上/gi,
    new RegExp(`早晨${chineseNumbers}+点`, 'gi'),
    /早晨\d+点/gi,
    /早晨/gi,
    new RegExp(`上午${chineseNumbers}+点`, 'gi'),
    /上午\d+点/gi,
    /上午/gi,
    new RegExp(`中午${chineseNumbers}+点`, 'gi'),
    /中午\d+点/gi,
    /中午/gi,
    new RegExp(`下午${chineseNumbers}+点`, 'gi'),
    /下午\d+点/gi,
    /下午/gi,
    new RegExp(`傍晚${chineseNumbers}+点`, 'gi'),
    /傍晚\d+点/gi,
    /傍晚/gi,
    new RegExp(`晚上${chineseNumbers}+点`, 'gi'),
    /晚上\d+点/gi,
    /晚上/gi,
    new RegExp(`夜里${chineseNumbers}+点`, 'gi'),
    /夜里\d+点/gi,
    /夜里/gi,
    new RegExp(`深夜${chineseNumbers}+点`, 'gi'),
    /深夜\d+点/gi,
    /深夜/gi,
    new RegExp(`凌晨${chineseNumbers}+点`, 'gi'),
    /凌晨\d+点/gi,
    /凌晨/gi,
    new RegExp(`${chineseNumbers}+点${chineseNumbers}+分`, 'gi'),
    /\d+点\d+分/gi,
    new RegExp(`${chineseNumbers}+点半`, 'gi'),
    /\d+点半/gi,
    new RegExp(`${chineseNumbers}+点`, 'gi'),
    /\d+点/gi,
    /点/gi,
    /本周/gi,
    /下周/gi,
    new RegExp(`${chineseNumbers}+月${chineseNumbers}+日`, 'gi'),
    /\d+月\d+日/gi,
    new RegExp(`${chineseNumbers}+月`, 'gi'),
    /\d+月/gi,
    /月/gi,
    new RegExp(`${chineseNumbers}+号`, 'gi'),
    /\d+号/gi,
    /号/gi,
    new RegExp(`${chineseNumbers}+日`, 'gi'),
    /\d+日/gi,
    /日/gi
  ];

  for (const pattern of timePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  const fuzzyTimePatterns = [
    /一会/gi, /一会儿/gi, /过一会/gi, /过一会儿/gi, /马上/gi, /立刻/gi,
    /马上就/gi, /稍后/gi, /等会儿/gi, /等一下/gi, /不久/gi, /很快/gi
  ];

  for (const pattern of fuzzyTimePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  const actionWords = [
    '提醒我', '提醒', '帮我记', '我要', '安排', '帮我',
    '设置提醒', '新建', '创建', '添加', '记一下', '新增'
  ];

  for (const word of actionWords) {
    cleaned = cleaned.replace(new RegExp(word, 'gi'), '');
  }

  cleaned = cleaned.replace(/在|于|到|把|要/g, ' ');

  cleaned = cleaned.replace(/[，,。！!？?、；;：:]/g, '');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  cleaned = cleaned.replace(/^[帮请让]/g, '').trim();

  return cleaned || '新事件';
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
      duration: null,
      relativeMinutes: null,
      period: null,
      reminderMinutes: null
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

  const reminderMinutes = extractReminderMinutes(text)
  if (reminderMinutes !== null) {
    result.entities.reminderMinutes = reminderMinutes
  }

  const fuzzyTime = extractFuzzyTime(text)
  if (fuzzyTime) {
    result.entities.date = 'relative'
    result.entities.relativeMinutes = fuzzyTime.minutes
    result.confidence = 0.9
  } else {
    const relativeTime = extractRelativeTime(text)
    if (relativeTime) {
      result.entities.date = 'relative'
      result.entities.time = {
        unit: relativeTime.unit,
        value: relativeTime.value
      }
      result.confidence = 0.85
    } else {
      const absoluteTime = extractAbsoluteTime(text)
      if (absoluteTime) {
        result.entities.date = absoluteTime.type
        if (absoluteTime.hour !== undefined) {
          result.entities.time = {
            hour: absoluteTime.hour,
            minute: absoluteTime.minute || 0
          }
        }
        if (absoluteTime.period) {
          result.entities.period = absoluteTime.period
        }
        if (absoluteTime.dayOfWeek) {
          result.entities.dayOfWeek = absoluteTime.dayOfWeek
        }
        result.confidence = 0.95
      }
    }
  }

  result.entities.title = cleanTitle(text);

  return result
}

export function resolveEventFromCommand(command, baseDate = new Date()) {
  const now = new Date(baseDate)

  const event = {
    title: command.entities.title || '新事件',
    startTime: new Date(now),
    endTime: new Date(now),
    isAllDay: false,
    category: command.entities.category || 'life',
    reminder: command.entities.reminderMinutes || 30,
    repeat: 'none',
    note: ''
  }

  if (command.entities.relativeMinutes !== null && command.entities.relativeMinutes !== undefined) {
    event.startTime = new Date(now.getTime() + command.entities.relativeMinutes * 60 * 1000)
    event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
    return event
  }

  if (command.entities.date === 'relative' && command.entities.time) {
    const { unit, value } = command.entities.time
    let ms = 0
    switch (unit) {
      case 'minute':
        ms = value * 60 * 1000
        break
      case 'hour':
        ms = value * 60 * 60 * 1000
        break
      case 'day':
        ms = value * 24 * 60 * 60 * 1000
        break
    }
    event.startTime = new Date(now.getTime() + ms)
    event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
    return event
  }

  if (!command.entities.date) {
    event.isAllDay = true
    return event
  }

  switch (command.entities.date) {
    case 'today':
      event.startTime = new Date(now)
      break
    case 'tomorrow':
      event.startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      break
    case 'dayAfter':
      event.startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
      break
    case 'thisWeek':
      event.startTime = new Date(now)
      event.isAllDay = true
      break
    case 'nextWeek':
      const daysUntilNextWeek = 7 - now.getDay() + 1
      event.startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextWeek)
      event.isAllDay = true
      break
    case 'monthDay':
      const month = parseInt(command.entities.time?.hour || now.getMonth() + 1) - 1
      const day = parseInt(command.entities.time?.minute || now.getDate())
      event.startTime = new Date(now.getFullYear(), month, day)
      break
    case 'dayOfMonth':
      event.startTime = new Date(now.getFullYear(), now.getMonth(), parseInt(command.entities.time?.hour || now.getDate()))
      break
    case 'todayTime':
      event.startTime = new Date(now)
      break
    case 'periodTime':
      event.startTime = new Date(now)
      break
    default:
      event.startTime = new Date(now)
  }

  if (command.entities.time) {
    event.startTime.setHours(command.entities.time.hour, command.entities.time.minute || 0, 0, 0)
    event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
  } else if (command.entities.period && TIME_PERIODS[command.entities.period]) {
    event.startTime.setHours(TIME_PERIODS[command.entities.period].hour, 0, 0, 0)
    event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
  } else if (command.entities.date !== 'thisWeek' && command.entities.date !== 'nextWeek') {
    event.isAllDay = true
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

  const reminderStr = event.reminder ? `，提前${event.reminder}分钟提醒` : ''

  return `已添加：${event.title}，${dateStr}，${timeStr}${reminderStr}`
}
