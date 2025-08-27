'use client';

import { useState, useEffect, useRef } from 'react';
import { EventItem, isEventActive } from '@/lib/types';
import { Clock, MapPin, Gift, Bell, BellOff, Coins, DollarSign, Gem, Pin, PinOff } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: EventItem;
  isUpcoming?: boolean;
  onFollowToggle: (eventId: string) => void;
  onPinToggle: (eventId: string) => void;
}

export default function EventCard({ event, isUpcoming = false, onFollowToggle, onPinToggle }: EventCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [nextEventTime, setNextEventTime] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right'>('right');
  const cardRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Extract currency rewards (Ruud, WC, GP)
  const getCurrencyRewards = () => {
    const currencies = {
      ruud: null as string | null,
      wc: null as string | null,
      gp: null as string | null
    };

    event.items.forEach(item => {
      const lowerItem = item.toLowerCase();
      if (lowerItem.includes('ruud')) {
        currencies.ruud = item;
      } else if (lowerItem.includes('wc')) {
        currencies.wc = item;
      } else if (lowerItem.includes('gp')) {
        currencies.gp = item;
      }
    });

    return currencies;
  };

  const currencies = getCurrencyRewards();
  const otherRewards = event.items.filter(item => {
    const lower = item.toLowerCase();
    return !lower.includes('ruud') && !lower.includes('wc') && !lower.includes('gp');
  });

  // Check tooltip position
  useEffect(() => {
    if (showTooltip && cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const tooltipWidth = 384; // w-96 = 24rem = 384px
      const windowWidth = window.innerWidth;
      
      // If card is on the right side of screen, show tooltip on left
      if (cardRect.right + tooltipWidth + 20 > windowWidth) {
        setTooltipPosition('left');
      } else {
        setTooltipPosition('right');
      }
    }
  }, [showTooltip]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      // Check if event is currently active
      const activeTime = event.times.find(time => isEventActive(time));
      setIsActive(!!activeTime);
      
      const upcomingTimes = event.times.filter(time => time > now);
      
      if (upcomingTimes.length > 0) {
        const nextTime = upcomingTimes[0];
        setNextEventTime(nextTime);
        
        const totalSeconds = Math.floor((nextTime.getTime() - now.getTime()) / 1000);
        
        if (totalSeconds <= 0) {
          setTimeLeft('Event Started!');
        } else {
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        setTimeLeft('No upcoming events');
        setNextEventTime(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event.times]);

  return (
    <div 
      ref={cardRef}
      className={`card relative ${isUpcoming ? 'border-2 border-green-600 rounded-lg' : ''} ${isActive ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {isUpcoming && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg text-white font-bold text-sm tracking-wide animate-pulse ring-2 ring-blue-400/60">
          <Clock className="w-4 h-4 mr-1 animate-spin-slow" />
          NEXT EVENT
        </div>
      )}
      <div className={`bg-gray-900/90 backdrop-blur rounded-lg border border-gray-700 p-4 h-full hover:border-gray-600 transition-all ${isUpcoming ? 'pt-12' : ''}`}>
        <div className="space-y-3">
          {/* Header with badges */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isActive && (
                <div className="text-xs bg-red-600 text-white px-2 py-1 rounded inline-block mb-1 animate-pulse">
                  LIVE NOW
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{event.name}</h3>
            </div>
            
            {/* Pin Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPinToggle(event.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                event.pinned 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
              title={event.pinned ? 'Unpin' : 'Pin to top'}
            >
              {event.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{event.map}</span>
          </div>

          {/* Currency Rewards Display */}
          <div className="flex gap-2 flex-wrap">
            {currencies.ruud && (
              <div className="bg-purple-900/50 px-2 py-1 rounded text-xs text-purple-300 flex items-center gap-1">
                <Gem className="w-3 h-3" />
                {currencies.ruud.replace(/ruud/i, 'Ruud')}
              </div>
            )}
            {currencies.wc && (
              <div className="bg-yellow-900/50 px-2 py-1 rounded text-xs text-yellow-300 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {currencies.wc.replace(/wc/i, 'WC')}
              </div>
            )}
            {currencies.gp && (
              <div className="bg-green-900/50 px-2 py-1 rounded text-xs text-green-300 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {currencies.gp.replace(/gp/i, 'GP')}
              </div>
            )}
          </div>

          <button
            onClick={() => onFollowToggle(event.id)}
            className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              event.following 
              ? 'bg-green-700 hover:bg-green-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
            }`}
          >
            {event.following ? (
              <>
                <Bell className="w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4" />
                Follow
              </>
            )}
          </button>

          {nextEventTime && (
            <div className="bg-gray-800/50 rounded p-2 border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Next Event:</p>
              <p className="text-sm font-semibold text-gray-300">
                Today {format(nextEventTime, 'HH:mm')}
              </p>
            </div>
          )}

          <div className={`${isActive ? 'bg-gradient-to-r from-green-800 to-emerald-800' : 'bg-gray-800'} text-white rounded p-3 text-center border ${isActive ? 'border-green-600' : 'border-gray-700'}`}>
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-xs">{isActive ? 'Event Active!' : 'Time Until Event'}</span>
            </div>
            <div className="text-xl font-bold font-mono">{isActive ? 'LIVE' : timeLeft}</div>
          </div>
        </div>
      </div>

      {/* Enhanced Tooltip with Glassmorphism - Position aware */}
      <div 
        ref={tooltipRef}
        className={`tooltip absolute z-50 w-96 ${showTooltip ? '' : 'hidden'} ${
          tooltipPosition === 'left' ? 'right-full mr-3' : 'left-full ml-3'
        }`}
        style={{ 
          top: '50%', 
          transform: 'translateY(-50%)',
          maxWidth: 'min(384px, calc(100vw - 2rem))'
        }}
      >
        <div className="glass-effect rounded-xl p-5 shadow-2xl border border-white/10">
          <div className="tooltip-content space-y-4">
            {/* Location Section */}
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg mr-3">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-200">Location</h4>
                  <p className="text-white font-bold">{event.map}</p>
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            {otherRewards.length > 0 && (
              <div className="border-b border-white/10 pb-3">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                    <Gift className="w-5 h-5 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-200">Special Rewards</h4>
                </div>
                <div className="ml-11 max-h-40 overflow-y-auto search-suggestions">
                  <ul className="text-xs space-y-1 text-gray-300">
                    {otherRewards.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Spawn Times Section */}
            <div>
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="font-semibold text-sm text-gray-200">Daily Spawn Times</h4>
              </div>
              <div className="ml-11 flex flex-wrap gap-2">
                {Array.from(new Set(event.times.map(time => format(time, 'HH:mm'))))
                  .slice(0, 12)
                  .map((timeStr, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300 font-mono">
                      {timeStr}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
