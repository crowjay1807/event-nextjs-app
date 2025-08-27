export class StorageService {
  private static readonly FOLLOWED_EVENTS_KEY = 'followedEvents';
  private static readonly PINNED_EVENTS_KEY = 'pinnedEvents';
  private static readonly NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled';

  // Save followed events to localStorage
  static saveFollowedEvents(eventIds: string[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.FOLLOWED_EVENTS_KEY, JSON.stringify(eventIds));
    }
  }

  // Get followed events from localStorage
  static getFollowedEvents(): string[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.FOLLOWED_EVENTS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing followed events:', e);
        }
      }
    }
    return [];
  }

  // Save pinned events to localStorage
  static savePinnedEvents(eventIds: string[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.PINNED_EVENTS_KEY, JSON.stringify(eventIds));
    }
  }

  // Get pinned events from localStorage
  static getPinnedEvents(): string[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.PINNED_EVENTS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing pinned events:', e);
        }
      }
    }
    return [];
  }

  // Add a pinned event
  static addPinnedEvent(eventId: string): void {
    const events = this.getPinnedEvents();
    if (!events.includes(eventId)) {
      // Limit to 4 pinned events
      if (events.length >= 4) {
        events.shift(); // Remove oldest
      }
      events.push(eventId);
      this.savePinnedEvents(events);
    }
  }

  // Remove a pinned event
  static removePinnedEvent(eventId: string): void {
    const events = this.getPinnedEvents();
    const filtered = events.filter(id => id !== eventId);
    this.savePinnedEvents(filtered);
  }

  // Check if an event is pinned
  static isEventPinned(eventId: string): boolean {
    const events = this.getPinnedEvents();
    return events.includes(eventId);
  }

  // Save notification preference
  static saveNotificationPreference(enabled: boolean): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.NOTIFICATIONS_ENABLED_KEY, JSON.stringify(enabled));
    }
  }

  // Get notification preference
  static getNotificationPreference(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.NOTIFICATIONS_ENABLED_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing notification preference:', e);
        }
      }
    }
    return false;
  }

  // Add a followed event
  static addFollowedEvent(eventId: string): void {
    const events = this.getFollowedEvents();
    if (!events.includes(eventId)) {
      events.push(eventId);
      this.saveFollowedEvents(events);
    }
  }

  // Remove a followed event
  static removeFollowedEvent(eventId: string): void {
    const events = this.getFollowedEvents();
    const filtered = events.filter(id => id !== eventId);
    this.saveFollowedEvents(filtered);
  }

  // Check if an event is followed
  static isEventFollowed(eventId: string): boolean {
    const events = this.getFollowedEvents();
    return events.includes(eventId);
  }
}
