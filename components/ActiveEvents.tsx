'use client';

import { useState, useEffect } from 'react';
import { EventItem, isEventActive } from '@/lib/types';
import { Clock, MapPin, PlayCircle } from 'lucide-react';

interface ActiveEventsProps {
  events: EventItem[];
}

export default function ActiveEvents({ events }: ActiveEventsProps) {
  const [activeEvents, setActiveEvents] = useState<Array<{
    event: EventItem;
    activeTime: Date;
    timeRemaining: string;
  }>>([]);

  useEffect(() => {
    const updateActiveEvents = () => {
      const now = new Date();
      const active: typeof activeEvents = [];

      events.forEach(event => {
        event.times.forEach(time => {
          if (isEventActive(time)) {
            const timeDiff = 15 * 60 * 1000 - (now.getTime() - time.getTime()); // 15 minutes - elapsed time
            const minutesLeft = Math.floor(timeDiff / 1000 / 60);
            const secondsLeft = Math.floor((timeDiff / 1000) % 60);
            
            active.push({
              event,
              activeTime: time,
              timeRemaining: `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`
            });
          }
        });
      });

      setActiveEvents(active);
    };

    updateActiveEvents();
    const interval = setInterval(updateActiveEvents, 1000);

    return () => clearInterval(interval);
  }, [events]);

  if (activeEvents.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <PlayCircle className="w-6 h-6 text-green-400 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Active Events (Running Now)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeEvents.map((active, index) => (
          <div 
            key={`${active.event.id}-${active.activeTime.getTime()}`}
            className="relative bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur rounded-lg border-2 border-green-500/50 p-4 animate-pulse"
          >
            {/* Live Badge */}
            <div className="absolute -top-2 -right-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">{active.event.name}</h3>
              
              <div className="flex items-center text-xs text-gray-300">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{active.event.map}</span>
              </div>

              <div className="bg-black/40 rounded p-2">
                <div className="text-xs text-green-400 mb-1">Time Remaining</div>
                <div className="text-lg font-bold font-mono text-white">
                  {active.timeRemaining}
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Started at {active.activeTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
