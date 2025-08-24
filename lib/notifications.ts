export class NotificationService {
  private static notificationIntervals: Map<string, NodeJS.Timeout> = new Map();
  private static notifiedEvents: Set<string> = new Set(); // Track notified events to avoid duplicates

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static showNotification(title: string, message: string, important: boolean = false) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: important,
        tag: important ? 'important' : 'normal'
      });

      // Auto close non-important notifications after 5 seconds
      if (!important) {
        setTimeout(() => notification.close(), 5000);
      }

      // Play sound for important notifications
      if (important) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzWH0fPTgjMGHm7A7+OZURE');
        audio.play().catch(e => console.log('Could not play notification sound'));
      }

      return notification;
    } else if (important) {
      // Fallback to alert for important notifications
      alert(`${title}: ${message}`);
    }
  }

  static setupEventNotification(eventId: string, eventName: string, eventTimes: Date[]) {
    // Clear existing notification if any
    this.clearEventNotification(eventId);

    const checkNotification = () => {
      const now = new Date();
      
      // Find all upcoming times within the next 5 minutes
      const upcomingTimes = eventTimes.filter(time => {
        const timeDiff = (time.getTime() - now.getTime()) / 1000 / 60; // difference in minutes
        return timeDiff > 0 && timeDiff <= 5;
      });

      upcomingTimes.forEach(upcomingTime => {
        // Create unique key for this specific event time
        const notificationKey = `${eventId}-${upcomingTime.getTime()}`;
        
        // Check if we've already notified for this specific time
        if (!this.notifiedEvents.has(notificationKey)) {
          const minutes = Math.floor((upcomingTime.getTime() - now.getTime()) / 1000 / 60);
          this.showNotification(
            `🎮 ${eventName}`,
            `Event starts in ${minutes} minute(s)! Get ready!`,
            true
          );
          
          // Mark this specific time as notified
          this.notifiedEvents.add(notificationKey);
          
          // Remove from notified set after the event time passes (clean up)
          setTimeout(() => {
            this.notifiedEvents.delete(notificationKey);
          }, 6 * 60 * 1000); // Remove after 6 minutes
        }
      });
    };

    // Check every 30 seconds for any upcoming events
    const intervalId = setInterval(checkNotification, 30000);
    this.notificationIntervals.set(eventId, intervalId);
    
    // Check immediately
    checkNotification();
  }

  static clearEventNotification(eventId: string) {
    const interval = this.notificationIntervals.get(eventId);
    if (interval) {
      clearInterval(interval);
      this.notificationIntervals.delete(eventId);
    }
    
    // Clear notified events for this event
    const keysToDelete: string[] = [];
    this.notifiedEvents.forEach(key => {
      if (key.startsWith(eventId + '-')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.notifiedEvents.delete(key));
  }

  static clearAllNotifications() {
    this.notificationIntervals.forEach((interval) => clearInterval(interval));
    this.notificationIntervals.clear();
    this.notifiedEvents.clear();
  }

  // Setup notifications for all followed events
  static setupAllFollowedEvents(events: Array<{id: string, name: string, times: Date[]}>) {
    events.forEach(event => {
      this.setupEventNotification(event.id, event.name, event.times);
    });
  }
}
