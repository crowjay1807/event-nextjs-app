'use client';

import { useState, useEffect } from 'react';
import { EventItem, mockEvents } from '@/lib/types';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import AdminModal from '@/components/AdminModal';
import MainCountdown from '@/components/MainCountdown';
import { NotificationService } from '@/lib/notifications';
import { StorageService } from '@/lib/storage';
import { Plus, LogIn, LogOut, Edit2, Trash2, Bell, Settings } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminButton, setShowAdminButton] = useState(false);

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
    // Load followed events from localStorage
    const followedEventIds = StorageService.getFollowedEvents();
    const notificationPref = StorageService.getNotificationPreference();
    
    // Update events with followed status
    const eventsWithFollowStatus = mockEvents.map(event => ({
      ...event,
      following: followedEventIds.includes(event.id)
    }));
    
    setEvents(eventsWithFollowStatus);
    setFilteredEvents(sortEventsByTime(eventsWithFollowStatus));
    setNotificationsEnabled(notificationPref);
    
    // Setup notifications for followed events if notifications are enabled
    if (notificationPref && 'Notification' in window && Notification.permission === 'granted') {
      const followedEvents = eventsWithFollowStatus.filter(e => e.following);
      NotificationService.setupAllFollowedEvents(followedEvents);
    }
    
    setIsLoading(false);

    // Secret key combination to show admin button (Ctrl+Shift+A)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminButton(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
    }
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
      const currentFilter = filteredEvents.length !== events.length;
      if (currentFilter) {
        setFilteredEvents(prevFiltered => 
          prevFiltered.map(event => {
            const updated = updatedEvents.find(e => e.id === event.id);
            return updated || event;
          })
        );
      } else {
        setFilteredEvents(sortEventsByTime(updatedEvents));
      }
      
      return updatedEvents;
    });
  };

  const handleSearch = (query: string, filter: 'all' | 'maps' | 'items' | 'name') => {
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
      case 'maps':
        filtered = events.filter(event =>
          event.map.toLowerCase().includes(lowerQuery)
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

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassword('');
    } else {
      alert('Incorrect password!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleSaveEvent = (event: EventItem) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    } else {
      setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
    }
    setEditingEvent(null);
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      // Remove from localStorage if it was followed
      StorageService.removeFollowedEvent(eventId);
      NotificationService.clearEventNotification(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading events...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <MainCountdown events={filteredEvents} />
      </div>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Invasion Events (GMT+7)</h1>
          
          <div className="flex gap-3">
            <button
              onClick={handleRequestNotifications}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                notificationsEnabled
                  ? 'bg-green-800 text-white hover:bg-green-700 border-green-600'
                  : 'bg-yellow-800 text-white hover:bg-yellow-700 border-yellow-600'
              }`}
            >
              <Bell className="w-5 h-5" />
              {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
            </button>
            
            {/* Admin button - hidden by default */}
            {showAdminButton && (
              <>
                {isAdmin ? (
                  <>
                    <button
                      onClick={handleAddNew}
                      className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 border border-green-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Event
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 border border-red-600 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-700 border border-blue-600 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Admin
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <SearchBar onSearch={handleSearch} events={events} />
        
        {/* Show count of followed events */}
        {events.filter(e => e.following).length > 0 && (
          <div className="text-gray-400 text-sm mb-4">
            Following {events.filter(e => e.following).length} events
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative group">
              <EventCard 
                event={event} 
                isUpcoming={index === 0}
                onFollowToggle={handleFollowToggle}
              />
              
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 border border-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-600 border border-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events found matching your search.</p>
          </div>
        )}
      </div>

      <AdminModal
        event={editingEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">Admin Login</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg mb-4 focus:border-gray-600 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 border border-gray-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setPassword('');
                }}
                className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Hint: Use "admin123" for demo
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
