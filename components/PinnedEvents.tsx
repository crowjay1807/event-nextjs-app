'use client';

import { useState, useEffect } from 'react';
import { EventItem } from '@/lib/types';
import { Clock, MapPin, X, Pin } from 'lucide-react';
import { format } from 'date-fns';

interface PinnedEventsProps {
  events: EventItem[];
  onUnpin: (eventId: string) => void;
}

export default function PinnedEvents({ events, onUnpin }: PinnedEventsProps) {
  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const newCountdowns: { [key: string]: string } = {};

      events.forEach(event => {
        const upcomingTimes = event.times.filter(time => time > now);
        if (upcomingTimes.length > 0) {
          const nextTime = upcomingTimes[0];
          const totalSeconds = Math.floor((nextTime.getTime() - now.getTime()) / 1000);
          
          if (totalSeconds <= 0) {
            newCountdowns[event.id] = 'Started!';
          } else {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            newCountdowns[event.id] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          }
        } else {
          newCountdowns[event.id] = 'No events';
        }
      });

      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 mb-6 border border-gray-800">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Pin className="w-5 h-5" />
          <p className="text-sm">No pinned events. Pin up to 4 events for quick access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {events.map(event => {
        const nextTime = event.times.filter(t => t > new Date())[0];
        
        return (
          <div key={event.id} className="relative group bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur rounded-xl border border-purple-500/30 p-4 hover:border-purple-500/60 transition-all">
            {/* Unpin Button */}
            <button
              onClick={() => onUnpin(event.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg"
              title="Unpin event"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Pinned Badge */}
            <div className="absolute top-2 left-2">
              <div className="bg-purple-600/80 px-2 py-0.5 rounded-full">
                <Pin className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-bold text-white truncate">{event.name}</h3>
              
              <div className="flex items-center text-xs text-gray-400">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{event.map}</span>
              </div>

              {nextTime && (
                <div className="text-xs text-gray-300">
                  Next: {format(nextTime, 'HH:mm')}
                </div>
              )}

              <div className="bg-black/30 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-3 h-3 mr-1 text-purple-400" />
                  <span className="text-xs text-purple-400">Countdown</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {countdowns[event.id] || '--:--:--'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
