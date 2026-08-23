'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface Level {
  price: number;
  type: 'support' | 'resistance';
  strength: 'strong' | 'medium' | 'weak';
  label: string;
}

export default function SupportLevels() {
  const [currentPrice, setCurrentPrice] = useState(4523);
  const [notifiedLevels, setNotifiedLevels] = useState<Set<number>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const prevPriceRef = useRef(4523);

  const levels: Level[] = [
    { price: 4480, type: 'support', strength: 'strong', label: 'Major Support' },
    { price: 4500, type: 'support', strength: 'medium', label: 'Psychological Level' },
    { price: 4510, type: 'support', strength: 'weak', label: 'Recent Low' },
    { price: 4530, type: 'resistance', strength: 'weak', label: 'Recent High' },
    { price: 4550, type: 'resistance', strength: 'medium', label: 'Psychological Level' },
    { price: 4580, type: 'resistance', strength: 'strong', label: 'Major Resistance' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 10;
      setCurrentPrice(prev => {
        const newPrice = prev + variation;
        
        levels.forEach(level => {
          const prevPrice = prevPriceRef.current;
          const crossedUp = prevPrice < level.price && newPrice >= level.price;
          const crossedDown = prevPrice > level.price && newPrice <= level.price;

          if ((crossedUp || crossedDown) && !notifiedLevels.has(level.price)) {
            const direction = crossedUp ? 'ABOVE' : 'BELOW';
            toast.error(` LEVEL BREAK: ${level.label}`, {
              description: `Price broke ${direction} $${level.price.toFixed(2)}!`,
              duration: 10000,
            });
            setNotifiedLevels(prevSet => new Set(prevSet).add(level.price));
          }
        });
        
        prevPriceRef.current = newPrice;
        return newPrice;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [notifiedLevels]);

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* POINT 2: Key Price Levels Button - Dark Grey, Black Text, No Icon */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="neu-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Centered
          width: '100%',
          minHeight: '64px',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '600',
          backgroundColor: '#CCCCCC', // Dark Grey
          color: '#000000',           // Black Text
          borderRadius: '9999px',
          boxShadow: '7px 7px 14px var(--shadow-dark), -7px -7px 14px var(--shadow-light)'
        }}
      >
        Key Price Levels {isExpanded ? '▼' : '▶'}
      </button>

      {/* Dropdown with Levels */}
      {isExpanded && (
        <div style={{ marginTop: '16px' }} className="animate-fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {levels.map((level) => {
              const distance = Math.abs(currentPrice - level.price);
              const isAbove = currentPrice > level.price;
              const bgColor = level.type === 'support' ? '#9EBCEE' : '#f0b0b0';
              
              return (
                <div 
                  key={level.price}
                  className="neu-flat"
                  style={{
                    backgroundColor: bgColor,
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <p className="font-medium text-primary-custom font-semibold">
                        ${level.price.toFixed(2)}
                      </p>
                      <p className="font-caption-sm text-secondary-custom">
                        {level.label}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="font-caption-sm font-semibold text-primary-custom">
                      {isAbove ? '▼' : '▲'} ${distance.toFixed(2)}
                    </p>
                    <p className="font-caption-sm text-secondary-custom">
                      {level.strength}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}