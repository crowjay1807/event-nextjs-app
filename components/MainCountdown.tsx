'use client';

import { useState, useEffect } from 'react';
import { EventItem } from '@/lib/types';
import { Clock, MapPin, Gift } from 'lucide-react';

interface MainCountdownProps {
  events: EventItem[];
}

export default function MainCountdown({ events }: MainCountdownProps) {
  const [nextEvent, setNextEvent] = useState<EventItem | null>(null);
  const [nextEventTime, setNextEventTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

  useEffect(() => {
    const updateMainCountdown = () => {
      const now = new Date();
      
      // Find the event with the nearest upcoming time
      let nearestEvent: EventItem | null = null;
      let nearestTime: Date | null = null;
      
      events.forEach(event => {
        const upcomingTimes = event.times.filter(time => time > now);
        if (upcomingTimes.length > 0) {
          const nextTime = upcomingTimes[0];
          if (!nearestTime || nextTime < nearestTime) {
            nearestTime = nextTime;
            nearestEvent = event;
          }
        }
      });
      
      setNextEvent(nearestEvent);
      setNextEventTime(nearestTime);
      
      if (nearestTime) {
        const totalSeconds = Math.floor((nearestTime.getTime() - now.getTime()) / 1000);
        
        if (totalSeconds <= 0) {
          setTimeLeft('Event Started!');
        } else {
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        setTimeLeft('--:--:--');
      }
    };

    updateMainCountdown();
    const interval = setInterval(updateMainCountdown, 1000);

    return () => clearInterval(interval);
  }, [events]);

  if (!nextEvent || !nextEventTime) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Next Event Starting In</h2>
        <div className="text-3xl font-bold mb-3">No upcoming events</div>
        <div className="text-5xl font-bold font-mono">--:--:--</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center mb-6">
      <h2 className="text-2xl font-bold mb-2">Next Event Starting In</h2>
      <div className="text-3xl font-bold mb-3 text-yellow-400">{nextEvent.name}</div>
      <div className="text-5xl font-bold font-mono mb-3 text-white">{timeLeft}</div>
      <div className="flex items-center justify-center gap-4 text-lg">
        <span className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-5 h-5" />
          {nextEvent.map}
        </span>
        <span className="text-gray-500">|</span>
        <span className="flex items-center gap-2 text-gray-300">
          <Gift className="w-5 h-5" />
          {nextEvent.items.length} rewards
        </span>
      </div>
    </div>
  );
}
