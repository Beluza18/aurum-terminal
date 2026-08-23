'use client';

import { useState } from 'react';
import BottomNavBar from '../components/BottomNavBar';

interface CalendarEvent {
  id: number;
  date: string;
  time: string;
  currency: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  forecast: string;
  previous: string;
  actual?: string;
}

export default function CalendarPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const events: CalendarEvent[] = [
    {
      id: 1,
      date: 'Aug 21',
      time: '14:30',
      currency: 'USD',
      event: 'Initial Jobless Claims',
      impact: 'high',
      forecast: '230K',
      previous: '227K',
      actual: '225K'
    },
    {
      id: 2,
      date: 'Aug 21',
      time: '16:00',
      currency: 'USD',
      event: 'Existing Home Sales',
      impact: 'medium',
      forecast: '3.95M',
      previous: '3.95M'
    },
    {
      id: 3,
      date: 'Aug 22',
      time: '10:00',
      currency: 'EUR',
      event: 'ECB President Lagarde Speaks',
      impact: 'high',
      forecast: '-',
      previous: '-'
    },
    {
      id: 4,
      date: 'Aug 22',
      time: '14:30',
      currency: 'USD',
      event: 'Durable Goods Orders',
      impact: 'high',
      forecast: '0.5%',
      previous: '0.8%'
    },
    {
      id: 5,
      date: 'Aug 23',
      time: '09:45',
      currency: 'USD',
      event: 'Flash Manufacturing PMI',
      impact: 'high',
      forecast: '51.5',
      previous: '51.8'
    },
    {
      id: 6,
      date: 'Aug 23',
      time: '12:00',
      currency: 'GBP',
      event: 'Retail Sales',
      impact: 'medium',
      forecast: '0.3%',
      previous: '-0.2%'
    }
  ];

  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(e => e.impact === selectedFilter);

  const getImpactStyles = (impact: string) => {
    if (impact === 'high') return { bg: '#fee2e2', text: '#dc2626', bar: '#ef4444', label: 'High' };
    if (impact === 'medium') return { bg: '#fef3c7', text: '#d97706', bar: '#f59e0b', label: 'Medium' };
    return { bg: '#dbeafe', text: '#2563eb', bar: '#3b82f6', label: 'Low' };
  };

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      padding: '24px 16px 140px 16px',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#000000', margin: 0 }}>
          Economic Calendar
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Upcoming market-moving events
        </p>
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
      }}>
        {(['all', 'high', 'medium', 'low'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '700',
                backgroundColor: isActive ? '#000' : '#fff',
                color: isActive ? '#fff' : '#000',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280', 
            backgroundColor: '#fff', 
            borderRadius: '16px', 
            border: '1px solid #e5e7eb' 
          }}>
            No events match this filter.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const styles = getImpactStyles(event.impact);
            
            return (
              <div 
                key={event.id}
                style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Impact Color Bar */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: styles.bar
                }}></div>

                <div style={{ paddingLeft: '12px' }}>
                  {/* Top Row: Date/Time & Impact */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#000000' }}>
                        {event.date}
                      </span>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                        {event.time}
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        color: '#fff', 
                        backgroundColor: '#000', 
                        padding: '2px 6px', 
                        borderRadius: '6px' 
                      }}>
                        {event.currency}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      backgroundColor: styles.bg,
                      color: styles.text,
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      {styles.label}
                    </span>
                  </div>

                  {/* Event Name */}
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#000000', 
                    marginBottom: '16px',
                    lineHeight: '1.4'
                  }}>
                    {event.event}
                  </h3>

                  {/* Data Row */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Actual
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: '800', color: '#000000' }}>
                        {event.actual || '-'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Forecast
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: '800', color: '#000000' }}>
                        {event.forecast}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Previous
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: '800', color: '#000000' }}>
                        {event.previous}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '16px', 
        padding: '20px', 
        border: '1px solid #e5e7eb' 
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>
          💡 How to Use
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          High-impact events can cause significant market volatility. Plan your trades around these releases and avoid entering positions just before major announcements.
        </p>
      </div>

      <BottomNavBar />
    </div>
  );
}