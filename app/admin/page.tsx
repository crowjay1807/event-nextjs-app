'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EventItem, mockEvents } from '@/lib/types';
import { DatabaseService } from '@/lib/database';
import { 
  Plus, Save, Trash2, Download, Upload, RefreshCw, 
  Clock, MapPin, Gift, ArrowLeft, Database, Shield
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [dbVersion, setDbVersion] = useState(0);

  // Form state
  const [formData, setFormData] = useState<Partial<EventItem>>({
    name: '',
    map: '',
    items: [],
    times: [],
    description: ''
  });
  const [newItem, setNewItem] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadEvents();
    }
  }, []);

  const loadEvents = () => {
    // Check if database has been modified, otherwise use default events
    if (DatabaseService.hasBeenModified()) {
      const dbEvents = DatabaseService.getEvents();
      setEvents(dbEvents);
    } else {
      setEvents(mockEvents);
      // Save default events to database
      DatabaseService.saveEvents(mockEvents);
    }
    
    setLastModified(DatabaseService.getLastModified());
    setDbVersion(DatabaseService.getVersion());
  };

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      loadEvents();
    } else {
      alert('Invalid password!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    router.push('/');
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddTime = () => {
    if (newTime) {
      const [hours, minutes] = newTime.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      setFormData(prev => ({
        ...prev,
        times: [...(prev.times || []), date]
      }));
      setNewTime('');
    }
  };

  const handleRemoveTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSaveEvent = () => {
    if (!formData.name || !formData.map || !formData.items?.length || !formData.times?.length) {
      alert('Please fill all required fields');
      return;
    }

    const eventToSave: EventItem = {
      id: editingEvent?.id || Date.now().toString(),
      name: formData.name,
      map: formData.map,
      items: formData.items,
      times: formData.times,
      description: formData.description,
      following: false
    };

    if (editingEvent) {
      DatabaseService.updateEvent(editingEvent.id, eventToSave);
    } else {
      DatabaseService.addEvent(eventToSave);
    }

    loadEvents();
    resetForm();
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      map: event.map,
      items: [...event.items],
      times: [...event.times],
      description: event.description
    });
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      DatabaseService.deleteEvent(eventId);
      loadEvents();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      map: '',
      items: [],
      times: [],
      description: ''
    });
    setEditingEvent(null);
    setShowEventForm(false);
    setNewItem('');
    setNewTime('');
  };

  const handleExportDatabase = () => {
    const data = DatabaseService.exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invasion-events-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (DatabaseService.importDatabase(content)) {
          loadEvents();
          alert('Database imported successfully!');
        } else {
          alert('Failed to import database. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetDatabase = () => {
    if (confirm('This will reset the database to default events. Are you sure?')) {
      DatabaseService.clearDatabase();
      DatabaseService.saveEvents(mockEvents);
      loadEvents();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
          />
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full mt-3 text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 border border-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Site
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 border border-red-700"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Database Info */}
          <div className="flex gap-6 text-sm text-gray-400">
            <span>Version: {dbVersion}</span>
            <span>Events: {events.length}</span>
            {lastModified && (
              <span>Last Modified: {format(lastModified, 'MMM dd, yyyy HH:mm')}</span>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              Add New Event
            </button>
            
            <button
              onClick={handleExportDatabase}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
            >
              <Download className="w-4 h-4" />
              Export Database
            </button>
            
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Database
              <input
                type="file"
                accept=".json"
                onChange={handleImportDatabase}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleResetDatabase}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-600"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </button>
          </div>
        </div>

        {/* Event Form */}
        {showEventForm && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  placeholder="e.g., Dragon Boss Raid"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Map/Location *</label>
                <input
                  type="text"
                  value={formData.map}
                  onChange={(e) => setFormData(prev => ({ ...prev, map: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  placeholder="e.g., Lorencia"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  placeholder="Optional description"
                />
              </div>
              
              {/* Items/Rewards */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Items/Rewards *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
                    placeholder="Add item..."
                  />
                  <button
                    onClick={handleAddItem}
                    className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {formData.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-gray-300">{item}</span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Spawn Times */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Spawn Times (GMT+7) *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  />
                  <button
                    onClick={handleAddTime}
                    className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {formData.times?.map((time, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-gray-300">{format(time, 'HH:mm')}</span>
                      <button
                        onClick={() => handleRemoveTime(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEvent}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                {editingEvent ? 'Update Event' : 'Save Event'}
              </button>
              
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">All Events</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Map</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Times</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm text-white">{event.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{event.map}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{event.items.length} items</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {Array.from(new Set(event.times.map(t => format(t, 'HH:mm')))).slice(0, 3).join(', ')}
                      {event.times.length > 3 && '...'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {events.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No events in database. Add your first event!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
