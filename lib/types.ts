export interface EventItem {
  id: string;
  name: string;
  map: string;
  items: string[];
  times: Date[];
  image?: string;
  description?: string;
  following?: boolean;
  pinned?: boolean; // Add pinned property
}

// Helper function to create today's date with specific time (GMT+7)
function createEventTime(hour: number, minute: number = 0): Date {
  const date = new Date();
  // Convert from GMT+2 to GMT+7 (add 5 hours)
  const adjustedHour = (hour + 5) % 24;
  date.setHours(adjustedHour, minute, 0, 0);
  
  // If the time has already passed today, set it for tomorrow
  if (date < new Date()) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
}

// Helper to create multiple times for an event
function createEventTimes(times: string[]): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  times.forEach(timeStr => {
    const [hour, minute] = timeStr.split(':').map(Number);
    // Convert from GMT+2 to GMT+7 (add 5 hours)
    const adjustedHour = (hour + 5) % 24;
    
    // Create dates for today and next 3 days
    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(adjustedHour, minute || 0, 0, 0);
      
      if (date > new Date()) {
        dates.push(date);
      }
    }
  });
  
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

// Create hourly events (every hour)
function createHourlyEvents(): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = 0; i < 48; i++) { // Next 48 hours
    const date = new Date(now);
    date.setHours(now.getHours() + i);
    date.setMinutes(0, 0, 0);
    dates.push(date);
  }
  
  return dates;
}

// Create events at :30 of every hour
function createHalfHourlyEvents(): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = 0; i < 48; i++) { // Next 48 hours
    const date = new Date(now);
    date.setHours(now.getHours() + i);
    date.setMinutes(30, 0, 0);
    if (date > now) {
      dates.push(date);
    }
  }
  
  return dates;
}

// Create events at :50 of every hour
function createEveryHour50MinuteEvents(): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = 0; i < 48; i++) { // Next 48 hours
    const date = new Date(now);
    date.setHours(now.getHours() + i);
    date.setMinutes(50, 0, 0);
    if (date > now) {
      dates.push(date);
    }
  }
  
  return dates;
}

// Create events at :35 of every hour
function createEveryHour35MinuteEvents(): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = 0; i < 48; i++) { // Next 48 hours
    const date = new Date(now);
    date.setHours(now.getHours() + i);
    date.setMinutes(35, 0, 0);
    if (date > now) {
      dates.push(date);
    }
  }
  
  return dates;
}

// Create events every 3 hours
function createEvery3HoursEvents(): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = 0; i < 16; i++) { // Next 16 occurrences (48 hours)
    const date = new Date(now);
    date.setHours(now.getHours() + (i * 3));
    date.setMinutes(0, 0, 0);
    dates.push(date);
  }
  
  return dates;
}

export const mockEvents: EventItem[] = [
  {
    id: '1',
    name: 'Ruud COW Appears!',
    map: 'Lorencia',
    items: ['100 ~ 1000 Ruud'],
    times: createHourlyEvents(),
    description: 'Invasion Event - Spawns every hour',
    following: false,
    pinned: false
  },
  {
    id: '2',
    name: 'Red Monkey Alert!',
    map: 'Ferea',
    items: [
      'Blessed Decoration Ring - 1 day',
      'Ability Enhancement Stone x5',
      '[Bound] Ability Crystal x10',
      'Ability Crystal x5'
    ],
    times: createEventTimes(['00:30', '03:30', '06:30', '16:30', '19:30', '21:30']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '3',
    name: 'Power Chicken!',
    map: 'Noria',
    items: ['150 WC', '200 ~ 2500 Ruud'],
    times: createEvery3HoursEvents(),
    description: 'Invasion Event - Every 3 hours',
    following: false,
    pinned: false
  },
  {
    id: '4',
    name: 'Fire Flame',
    map: 'Vulcanus',
    items: [
      'Jewel of Harmony',
      'Jewel of Creation',
      'Ability Crystal',
      'Elemental Rune',
      'Sphere Upgrade Rune',
      'Uriel\'s Feather',
      '3rd Wing Relic',
      'Large Complex Potion',
      'Bless of Light',
      'Golden Sentence'
    ],
    times: createEventTimes(['03:00', '06:00', '16:30', '19:30']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '5',
    name: 'White Sheep',
    map: 'Elbeland',
    items: ['300 GP', '300 ~ 2000 Ruud'],
    times: createEventTimes(['01:00', '03:00', '15:30', '20:00', '22:30']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '6',
    name: 'Green Chicken',
    map: 'Devias',
    items: [
      'Jewel of Bless (Durability: 2~5)',
      'Jewel of Soul (Durability: 2~5)',
      'Jewel of Life (Durability: 2~5)',
      'Jewel of Creation (Durability: 2~5)',
      'Jewel of Harmony (Durability: 2~5)'
    ],
    times: createEventTimes(['01:30', '04:00', '17:00', '20:30']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '7',
    name: 'Blue Horse',
    map: 'Twisted Karutan',
    items: [
      'Jewel of Creation',
      'Jewel of Harmony',
      '[Bound] Ability Crystal (Durability: 5/10)',
      'Ability Enhancement Stone',
      'Ability Crystal (Durability: 5/10/15)',
      'Spider Artifact Fragment',
      'Artifact Enchantment Stone (Durability: 1/2/3)',
      '[Bound] Shining Temple Guard Reinforcement Stone'
    ],
    times: createEventTimes(['02:30', '05:00', '16:00', '21:00']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '8',
    name: 'Green Puppy',
    map: 'Noria',
    items: ['50 GP', '200 ~ 1000 Ruud'],
    times: createHourlyEvents(),
    description: 'Invasion Event - Every hour',
    following: false,
    pinned: false
  },
  {
    id: '9',
    name: 'Red Cow',
    map: 'Scorched Canyon',
    items: ['300 WC', '1000 ~ 2500 Ruud'],
    times: createEventTimes(['03:45', '06:45', '19:45', '22:45']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '10',
    name: 'Green Horse',
    map: 'Ferea',
    items: [
      '[Bound] Shining Temple Guard Reinforcement Stone',
      'Ability Crystal (Durability: 1/2/3/5)',
      'Artifact Enchantment Stone (Durability: 1/3/5)',
      'Spider Artifact Fragment',
      'Ability Enhancement Stone (Durability: 1/3/5)'
    ],
    times: createEventTimes(['07:25', '09:25', '11:25', '13:25']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '11',
    name: 'White Monkey',
    map: 'Kanturu',
    items: [
      'Manticore Anvil',
      'Apocalypse Anvil',
      'Manticore Soul',
      'Soul of Apocalypse',
      'Talisman of Luck',
      'Uriel\'s Feather',
      'Ruud Box (2000)',
      'Elemental Rune (Durability: 10/20/30)',
      'Sphere Upgrade Rune (Durability: 5/7/9)',
      'Ability Crystal (Durability: 3/5)',
      'Ability Enhancement Stone (Durability: 3/5)'
    ],
    times: createEventTimes(['06:25', '08:25', '10:25', '12:00']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '12',
    name: 'Sylphid',
    map: 'Twisted Karutan',
    items: [
      'Rare Item Ticket 1 ~ 6',
      'Rare Item Ticket 8 & 9',
      'Green Box / Red Box / Purple Box',
      'Ancestral Frame',
      'Blood Crafting Frame',
      'Daze Crafting Frame',
      'Binding Frame',
      'Verdant Frame',
      'Ring of Ultimatum',
      'Ring of Block',
      'Protection Ring',
      'Battle Jasper Necklace',
      'Battle Lagoon Necklace',
      '[Bound] Shining Temple Guard Reinforcement Stone (Durability: 3/5/7/10)',
      'Ability Crystal (Durability: 3/5/8)',
      'Ability Enhancement Stone (Durability: 3/5)',
      'Artifact Enchantment Stone (Durability: 3/5)',
      'Uriel\'s Feather',
      'Elemental Rune (Durability: 10/20/30)',
      'Sphere Upgrade Rune (Durability: 5/7/9)',
      'Soul of Apocalypse',
      'Manticore Anvil',
      'Apocalypse Anvil',
      'Manticore Soul',
      'Ruud Box (2000)',
      'Talisman of Luck'
    ],
    times: createEventTimes(['00:00', '06:00', '12:00', '18:00']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '13',
    name: 'Metal Balrog',
    map: 'Devias 4',
    items: ['1000 WC', '2000 ~ 5000 Ruud'],
    times: createEventTimes(['02:00']),
    description: 'Invasion Event - Daily at 07:00 AM (GMT+7)',
    following: false,
    pinned: false
  },
  {
    id: '14',
    name: 'Hell Maine',
    map: 'Old Kethotum',
    items: [
      'Blessed Decoration Ring (1 Day)',
      '[Bound] Shining Temple Guard Reinforcement Stone (Durability: 1~10)',
      'Ability Crystal (Durability: 1~10)',
      'Ability Enhancement Stone (Durability: 3~5)',
      'Jewel of Chaos',
      'Jewel of Bless',
      'Jewel of Soul',
      'Jewel of Life',
      'Jewel of Creation',
      'Jewel of Harmony',
      'Gemstone',
      'Talisman of Luck'
    ],
    times: createEventTimes(['02:30', '08:30', '15:30', '20:30']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '15',
    name: 'Brown Horse',
    map: 'Devias',
    items: [
      '50 WC',
      '150 ~ 500 Ruud',
      'Jewel of Chaos',
      'Jewel of Bless',
      'Jewel of Soul',
      'Jewel of Life',
      'Jewel of Creation',
      'Jewel of Guardian',
      'Jewel of Harmony'
    ],
    times: createHalfHourlyEvents(),
    description: 'Invasion Event - Every hour at :30',
    following: false,
    pinned: false
  },
  {
    id: '16',
    name: 'Undine',
    map: 'Ashen Aida',
    items: [
      '200 WC',
      '500 ~ 2000 Ruud',
      'Rare Item Ticket 1 ~ 6',
      'Rare Item Ticket 8 & 9',
      'Spider Artifact Box',
      'Spider Artifact Box (Type 6 & 7)',
      'Spider Artifact Type 1 ~ 7',
      'Spider Artifact Fragment',
      'Artifact Enchantment Stone (Durability: 2/3/5/10/15)',
      'Ability Crystal (Durability: 5/7/10)',
      'Ability Enhancement Stone (Durability: 3/5)',
      '[Bound] Shining Temple Guard Reinforcement Stone (Durability: 5/7/10)'
    ],
    times: createEventTimes(['04:30', '09:30', '13:30', '18:30', '23:30']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  {
    id: '17',
    name: 'PK Night',
    map: 'Crywolf',
    items: [
      'Jewels',
      'Dark Jewels (Chance)',
      'Jewel of Kundun (Low chance)',
      'Jewel of Excess (Low chance)',
      'All Ancient Items',
      'Seed Capsule'
    ],
    times: createEventTimes(['04:30', '09:30', '13:30', '18:30', '23:30']),
    description: 'Invasion Event',
    following: false,
    pinned: false
  },
  // NEW EVENTS ADDED
  {
    id: '18',
    name: 'Dead Fear Gems',
    map: 'Lorencia',
    items: [
      '50wc',
      'Jewel of Harmony',
      'Gemstone'
    ],
    times: createEveryHour50MinuteEvents(),
    description: 'Invasion Event - Every hour at minute :50',
    following: false,
    pinned: false
  },
  {
    id: '19',
    name: 'Pouch of Blessing',
    map: 'Lorencia, Noria, Devias, Elbeland',
    items: [
      '100wc',
      '500-2000 Ruud'
    ],
    times: createEventTimes(['02:00', '05:00', '08:15', '21:00']),
    description: 'Invasion Event - Multiple maps',
    following: false,
    pinned: false
  },
  {
    id: '20',
    name: 'Jewel Puppy',
    map: 'Noria',
    items: [
      'Guaranteed x2 Jewel',
      'Additional 1 ~ 3 random jewels',
      'Low chance for Dark Jewel and Custom Jewels'
    ],
    times: createEveryHour35MinuteEvents(),
    description: 'Invasion Event - Every hour at minute :35',
    following: false,
    pinned: false
  }
];

// Function to check if an event is currently active (within 15 minutes of start)
export function isEventActive(eventTime: Date): boolean {
  const now = new Date();
  const timeDiff = (now.getTime() - eventTime.getTime()) / 1000 / 60; // difference in minutes
  return timeDiff >= 0 && timeDiff <= 15; // Event is active for 15 minutes
}

// Get all currently active events
export function getActiveEvents(events: EventItem[]): EventItem[] {
  return events.filter(event => 
    event.times.some(time => isEventActive(time))
  );
}
