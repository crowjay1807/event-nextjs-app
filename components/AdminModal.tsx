'use client';

import { useState } from 'react';
import { EventItem } from '@/lib/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface AdminModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventItem) => void;
}

export default function AdminModal({ event, isOpen, onClose, onSave }: AdminModalProps) {
  const [formData, setFormData] = useState<EventItem>(
    event || {
      id: Date.now().toString(),
      name: '',
      map: '',
      items: [''],
      times: [new Date()],
      description: '',
      following: false
    }
  );

  if (!isOpen) return null;

  const handleInputChange = (field: keyof EventItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    handleInputChange('items', newItems);
  };

  const addItem = () => {
    handleInputChange('items', [...formData.items, '']);
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    handleInputChange('items', newItems);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = new Date(value);
    handleInputChange('times', newTimes);
  };

  const addTime = () => {
    handleInputChange('times', [...formData.times, new Date()]);
  };

  const removeTime = (index: number) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    handleInputChange('times', newTimes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Map */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Map
            </label>
            <input
              type="text"
              value={formData.map}
              onChange={(e) => handleInputChange('map', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Items/Rewards */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Items/Rewards
            </label>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Enter item name"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-400 hover:bg-red-900 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-purple-400 hover:bg-gray-700 px-3 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          {/* Event Times */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Event Times
            </label>
            <div className="space-y-2">
              {formData.times.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={time.toISOString().slice(0, 16)}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeTime(index)}
                    className="p-2 text-red-400 hover:bg-red-900 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                className="flex items-center gap-2 text-purple-400 hover:bg-gray-700 px-3 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Time
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
