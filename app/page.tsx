'use client';

import { useState, useEffect } from 'react';
import { EventItem, mockEvents, getActiveEvents } from '@/lib/types';
import { DatabaseService } from '@/lib/database';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import PinnedEvents from '@/components/PinnedEvents';
import ActiveEvents from '@/components/ActiveEvents';
import { NotificationService } from '@/lib/notifications';
import { StorageService } from '@/lib/storage';
import { Bell, BellOff, Sparkles } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [pinnedEvents, setPinnedEvents] = useState<EventItem[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbVersion, setDbVersion] = useState(0);

  const sortEventsByTime = (eventsToSort: EventItem[]) => {
    return [...eventsToSort].sort((a, b) => {
      const now = new Date();
      const aNextTime = a.times.filter(t => t > now)[0] || new Date(9999, 11, 31);
      const bNextTime = b.times.filter(t => t > now)[0] || new Date(9999, 11, 31);
      return aNextTime.getTime() - bNextTime.getTime();
    });
  };

  // Initialize events and load saved preferences
  useEffect(() => {
    loadEventsFromDatabase();
    
    // Check for database updates periodically
    const versionCheckInterval = setInterval(() => {
      const currentVersion = DatabaseService.getVersion();
      if (currentVersion !== dbVersion) {
        loadEventsFromDatabase();
      }
    }, 5000); // Check every 5 seconds

    // Enable notifications on desktop
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(versionCheckInterval);
    };
  }, [dbVersion]);

  const loadEventsFromDatabase = () => {
    // Load events from database or use defaults
    let loadedEvents: EventItem[];
    
    if (DatabaseService.hasBeenModified()) {
      loadedEvents = DatabaseService.getEvents();
    } else {
      loadedEvents = mockEvents;
      // Save default events to database on first load
      DatabaseService.saveEvents(mockEvents);
    }

    // Load followed and pinned events from localStorage
    const followedEventIds = StorageService.getFollowedEvents();
    const pinnedEventIds = StorageService.getPinnedEvents();
    const notificationPref = StorageService.getNotificationPreference();
    
    // Update events with followed and pinned status
    const eventsWithStatus = loadedEvents.map(event => ({
      ...event,
      following: followedEventIds.includes(event.id),
      pinned: pinnedEventIds.includes(event.id)
    }));
    
    setEvents(eventsWithStatus);
    setFilteredEvents(sortEventsByTime(eventsWithStatus));
    setPinnedEvents(eventsWithStatus.filter(e => e.pinned));
    setNotificationsEnabled(notificationPref);
    setDbVersion(DatabaseService.getVersion());
    
    // Setup notifications for followed events if notifications are enabled
    if (notificationPref && 'Notification' in window && Notification.permission === 'granted') {
      const followedEvents = eventsWithStatus.filter(e => e.following);
      NotificationService.setupAllFollowedEvents(followedEvents);
    }
    
    setIsLoading(false);
  };

  // Auto-resort events every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFilteredEvents(prev => sortEventsByTime(prev));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRequestNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setNotificationsEnabled(true);
      StorageService.saveNotificationPreference(true);
      
      // Setup notifications for all followed events
      const followedEvents = events.filter(e => e.following);
      NotificationService.setupAllFollowedEvents(followedEvents);
      
      NotificationService.showNotification(
        'Notifications Enabled',
        'You will receive event reminders for all followed events!'
      );
    } else {
      setNotificationsEnabled(false);
      StorageService.saveNotificationPreference(false);
      alert('Please enable notifications in your browser settings to receive event alerts.');
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    StorageService.saveNotificationPreference(false);
    NotificationService.clearAllNotifications();
    NotificationService.showNotification(
      'Notifications Disabled',
      'You will no longer receive event reminders.'
    );
  };

  const handleFollowToggle = (eventId: string) => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        if (event.id === eventId) {
          const newFollowing = !event.following;
          
          if (newFollowing) {
            // Add to localStorage
            StorageService.addFollowedEvent(eventId);
            
            // Setup notification for this event if notifications are enabled
            if (notificationsEnabled) {
              NotificationService.setupEventNotification(
                event.id,
                event.name,
                event.times
              );
              NotificationService.showNotification(
                'Following Event',
                `You are now following ${event.name}. You'll be notified 5 minutes before each spawn time.`
              );
            }
          } else {
            // Remove from localStorage
            StorageService.removeFollowedEvent(eventId);
            
            // Clear notification for this event
            NotificationService.clearEventNotification(event.id);
            NotificationService.showNotification(
              'Unfollowed Event',
              `You stopped following ${event.name}.`
            );
          }
          
          return { ...event, following: newFollowing };
        }
        return event;
      });
      
      // Update filtered events as well
      setFilteredEvents(prev => 
        prev.map(event => {
          const updated = updatedEvents.find(e => e.id === event.id);
          return updated || event;
        })
      );
      
      return updatedEvents;
    });
  };

  const handlePinToggle = (eventId: string) => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        if (event.id === eventId) {
          const newPinned = !event.pinned;
          
          if (newPinned) {
            StorageService.addPinnedEvent(eventId);
            NotificationService.showNotification(
              'Event Pinned',
              `${event.name} has been pinned to the top.`
            );
          } else {
            StorageService.removePinnedEvent(eventId);
            NotificationService.showNotification(
              'Event Unpinned',
              `${event.name} has been unpinned.`
            );
          }
          
          return { ...event, pinned: newPinned };
        }
        return event;
      });
      
      // Update pinned events list
      setPinnedEvents(updatedEvents.filter(e => e.pinned));
      
      // Update filtered events
      setFilteredEvents(prev => 
        prev.map(event => {
          const updated = updatedEvents.find(e => e.id === event.id);
          return updated || event;
        })
      );
      
      return updatedEvents;
    });
  };

  const handleSearch = (query: string, filter: 'all' | 'items' | 'name') => {
    if (!query) {
      setFilteredEvents(sortEventsByTime(events));
      return;
    }

    const lowerQuery = query.toLowerCase();
    let filtered = events;

    switch (filter) {
      case 'name':
        filtered = events.filter(event =>
          event.name.toLowerCase().includes(lowerQuery)
        );
        break;
      case 'items':
        filtered = events.filter(event =>
          event.items.some(item => item.toLowerCase().includes(lowerQuery))
        );
        break;
      case 'all':
      default:
        filtered = events.filter(event =>
          event.name.toLowerCase().includes(lowerQuery) ||
          event.map.toLowerCase().includes(lowerQuery) ||
          event.items.some(item => item.toLowerCase().includes(lowerQuery)) ||
          (event.description && event.description.toLowerCase().includes(lowerQuery))
        );
        break;
    }

    setFilteredEvents(sortEventsByTime(filtered));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading events...</div>
      </main>
    );
  }

  // Tìm thời gian event sắp diễn ra gần nhất
  const now = new Date();
  const nextTimes = filteredEvents
    .map(event => event.times.filter(t => t > now)[0])
    .filter(Boolean);
  const minNextTime = nextTimes.length > 0 ? new Date(Math.min(...nextTimes.map(t => t.getTime()))) : null;

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Invasion Events Tracker
              </h1>
            </div>
            
            <div className="flex gap-3">
              {notificationsEnabled ? (
                <button
                  onClick={handleDisableNotifications}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-green-800/50 backdrop-blur text-white hover:bg-green-700/50 border-green-600"
                >
                  <Bell className="w-5 h-5" />
                  Notifications On
                </button>
              ) : (
                <button
                  onClick={handleRequestNotifications}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-yellow-800/50 backdrop-blur text-white hover:bg-yellow-700/50 border-yellow-600 animate-pulse"
                >
                  <BellOff className="w-5 h-5" />
                  Enable Notifications
                </button>
              )}
              
              {/* Admin access via /admin route */}
              <a
                href="/admin"
                className="hidden"
              >
                Admin
              </a>
            </div>
          </div>

          {/* Pinned Events */}
          <PinnedEvents 
            events={pinnedEvents}
            onUnpin={handlePinToggle}
          />

          {/* Active Events Section - Moved here below Pinned */}
          <ActiveEvents events={events} />
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} events={events} />
        
        {/* Statistics */}
        <div className="flex gap-4 mb-6 text-sm">
          <div className="text-gray-400">
            <span className="text-purple-400 font-bold">{events.length}</span> Total Events
          </div>
          <div className="text-gray-400">
            <span className="text-green-400 font-bold">{events.filter(e => e.following).length}</span> Following
          </div>
          <div className="text-gray-400">
            <span className="text-blue-400 font-bold">{pinnedEvents.length}</span> Pinned
          </div>
          <div className="text-gray-400">
            <span className="text-yellow-400 font-bold">{getActiveEvents(events).length}</span> Active Now
          </div>
        </div>

        {/* All Events Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">All Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((event) => {
              const eventNextTime = event.times.filter(t => t > now)[0];
              const isUpcoming = !!(minNextTime && eventNextTime && eventNextTime.getTime() === minNextTime.getTime() && !getActiveEvents(events).some(e => e.id === event.id));
              return (
                <EventCard 
                  key={event.id}
                  event={event} 
                  isUpcoming={isUpcoming}
                  onFollowToggle={handleFollowToggle}
                  onPinToggle={handlePinToggle}
                />
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No events found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
