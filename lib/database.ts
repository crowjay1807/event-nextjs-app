import { EventItem } from './types';

export class DatabaseService {
  private static readonly EVENTS_DB_KEY = 'invasionEventsDB';
  private static readonly DB_VERSION_KEY = 'dbVersion';
  private static readonly ADMIN_MODIFIED_KEY = 'adminModified';

  // Get all events from database
  static getEvents(): EventItem[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.EVENTS_DB_KEY);
      if (stored) {
        try {
          const events = JSON.parse(stored);
          // Convert date strings back to Date objects
          return events.map((event: any) => ({
            ...event,
            times: event.times.map((time: string) => new Date(time))
          }));
        } catch (e) {
          console.error('Error parsing events database:', e);
        }
      }
    }
    return [];
  }

  // Save events to database
  static saveEvents(events: EventItem[]): void {
    if (typeof window !== 'undefined') {
      // Convert Date objects to strings for storage
      const eventsToStore = events.map(event => ({
        ...event,
        times: event.times.map(time => time.toISOString())
      }));
      
      localStorage.setItem(this.EVENTS_DB_KEY, JSON.stringify(eventsToStore));
      localStorage.setItem(this.ADMIN_MODIFIED_KEY, new Date().toISOString());
      this.incrementVersion();
    }
  }

  // Check if database has been modified
  static hasBeenModified(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ADMIN_MODIFIED_KEY) !== null;
    }
    return false;
  }

  // Get database version
  static getVersion(): number {
    if (typeof window !== 'undefined') {
      const version = localStorage.getItem(this.DB_VERSION_KEY);
      return version ? parseInt(version, 10) : 0;
    }
    return 0;
  }

  // Increment database version
  private static incrementVersion(): void {
    const currentVersion = this.getVersion();
    localStorage.setItem(this.DB_VERSION_KEY, (currentVersion + 1).toString());
  }

  // Get last modified date
  static getLastModified(): Date | null {
    if (typeof window !== 'undefined') {
      const modified = localStorage.getItem(this.ADMIN_MODIFIED_KEY);
      return modified ? new Date(modified) : null;
    }
    return null;
  }

  // Add new event
  static addEvent(event: EventItem): void {
    const events = this.getEvents();
    events.push(event);
    this.saveEvents(events);
  }

  // Update event
  static updateEvent(eventId: string, updatedEvent: EventItem): void {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = updatedEvent;
      this.saveEvents(events);
    }
  }

  // Delete event
  static deleteEvent(eventId: string): void {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== eventId);
    this.saveEvents(filtered);
  }

  // Clear database
  static clearDatabase(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.EVENTS_DB_KEY);
      localStorage.removeItem(this.DB_VERSION_KEY);
      localStorage.removeItem(this.ADMIN_MODIFIED_KEY);
    }
  }

  // Export database as JSON
  static exportDatabase(): string {
    const events = this.getEvents();
    const exportData = {
      version: this.getVersion(),
      lastModified: this.getLastModified(),
      events: events,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import database from JSON
  static importDatabase(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      if (importData.events && Array.isArray(importData.events)) {
        this.saveEvents(importData.events);
        return true;
      }
    } catch (e) {
      console.error('Error importing database:', e);
    }
    return false;
  }
}
