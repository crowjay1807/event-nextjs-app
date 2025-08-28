'use client';

import { useState, useEffect, useRef } from 'react';
import { EventItem, isEventActive } from '@/lib/types';
import { Clock, MapPin, Gift, Bell, BellOff, Coins, DollarSign, Gem, Pin, PinOff, Zap, Timer } from 'lucide-react';
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
      className={`card relative h-full ${isActive ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`h-full flex flex-col bg-gray-900/90 backdrop-blur rounded-xl border ${isUpcoming && !isActive ? 'border-blue-500/50' : 'border-gray-700'} hover:border-gray-600 transition-all duration-300 overflow-hidden`}>
        {/* Status Badges Row - Fixed Height */}
        <div className="min-h-[44px] flex items-center">
          {(isUpcoming || isActive || event.pinned) ? (
            <div className="flex gap-2 px-3 py-2">
              {isActive && (
                <div className="inline-flex items-center gap-1 text-xs bg-red-600/20 border border-red-500/50 text-red-400 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3 animate-pulse" />
                  <span className="font-medium">LIVE NOW</span>
                </div>
              )}
              {isUpcoming && !isActive && (
                <div className="inline-flex items-center gap-1 text-xs bg-blue-600/20 border border-blue-500/50 text-blue-400 px-2 py-1 rounded-full">
                  <Timer className="w-3 h-3" />
                  <span className="font-medium">NEXT</span>
                </div>
              )}
              {event.pinned && (
                <div className="inline-flex items-center gap-1 text-xs bg-purple-600/20 border border-purple-500/50 text-purple-400 px-2 py-1 rounded-full">
                  <Pin className="w-3 h-3" />
                  <span className="font-medium">PINNED</span>
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-2">&nbsp;</div>
          )}
        </div>
        
        {/* Card Content - Flex Grow */}
        <div className="flex-1 flex flex-col p-4 pt-0 space-y-3">
          {/* Title and Pin Button - Fixed Height */}
          <div className="flex justify-between items-start gap-2 min-h-[32px]">
            <h3 className="text-lg font-bold text-white flex-1 line-clamp-2">{event.name}</h3>
            
            {/* Pin Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPinToggle(event.id);
              }}
              className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                event.pinned 
                  ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/50' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 border border-gray-700'
              }`}
              title={event.pinned ? 'Unpin' : 'Pin to top'}
            >
              {event.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Location - Fixed Height */}
          <div className="flex items-center text-gray-400 text-sm min-h-[20px]">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{event.map}</span>
          </div>

          {/* Currency Rewards Display - Fixed Height */}
          <div className="min-h-[32px] flex items-center">
            {(currencies.ruud || currencies.wc || currencies.gp) ? (
              <div className="flex gap-2 flex-wrap">
                {currencies.ruud && (
                  <div className="bg-purple-900/30 border border-purple-700/50 px-2.5 py-1 rounded-lg text-xs text-purple-300 flex items-center gap-1.5">
                    <Gem className="w-3 h-3" />
                    <span className="whitespace-nowrap">{currencies.ruud.replace(/ruud/i, 'Ruud')}</span>
                  </div>
                )}
                {currencies.wc && (
                  <div className="bg-yellow-900/30 border border-yellow-700/50 px-2.5 py-1 rounded-lg text-xs text-yellow-300 flex items-center gap-1.5">
                    <Coins className="w-3 h-3" />
                    <span className="whitespace-nowrap">{currencies.wc.replace(/wc/i, 'WC')}</span>
                  </div>
                )}
                {currencies.gp && (
                  <div className="bg-green-900/30 border border-green-700/50 px-2.5 py-1 rounded-lg text-xs text-green-300 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" />
                    <span className="whitespace-nowrap">{currencies.gp.replace(/gp/i, 'GP')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-600">No currency rewards</div>
            )}
          </div>

          {/* Spacer to push content down */}
          <div className="flex-1"></div>

          {/* Bottom Section - Always at bottom */}
          <div className="space-y-3">
            {/* Follow Button */}
            <button
              onClick={() => onFollowToggle(event.id)}
              className={`w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                event.following 
                ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/50' 
                : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700'
              }`}
            >
              {event.following ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  <span>Follow for Alerts</span>
                </>
              )}
            </button>

            {/* Next Event Time */}
            <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/50">
              <p className="text-xs text-gray-500 mb-0.5">Next Event:</p>
              <p className="text-sm font-semibold text-gray-300">
                {nextEventTime ? `Today at ${format(nextEventTime, 'HH:mm')}` : 'No scheduled time'}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className={`relative rounded-lg p-3 text-center overflow-hidden ${
              isActive 
                ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-600/50' 
                : 'bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/50'
            }`}>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-1 gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">{isActive ? 'Event Active' : 'Countdown'}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {isActive ? 'LIVE' : timeLeft}
                </div>
              </div>
            </div>
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
                    <span key={index} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300 font-mono border border-blue-500/30">
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
