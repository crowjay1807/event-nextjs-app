export class StorageService {
  private static readonly FOLLOWED_EVENTS_KEY = 'followedEvents';
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
