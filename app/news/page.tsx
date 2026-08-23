'use client';

import { useState, useEffect } from 'react';
import BottomNavBar from '../components/BottomNavBar';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  category: 'Gold' | 'Forex' | 'Macro' | 'Crypto';
  impact: 'High' | 'Medium' | 'Low';
  url?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
          setNews(data.news);
        } else {
          console.error('Failed to fetch news');
        }
      } catch (error) {
        console.error('News fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getImpactColor = (impact: string) => {
    if (impact === 'High') return '#f0b0b0'; 
    if (impact === 'Medium') return '#f0e4a0'; 
    return '#a7f3d0'; 
  };

  const getCategoryColor = (category: string) => {
    if (category === 'Gold') return '#f0e4a0';
    if (category === 'Forex') return '#a7f3d0';
    if (category === 'Crypto') return '#bfdbfe'; 
    return '#e5e7eb'; 
  };

  const filteredNews = activeFilter === 'All' 
    ? news 
    : news.filter(item => item.category === activeFilter);

  const filters = ['All', 'Gold', 'Crypto', 'Macro'];

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
        <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#000000', margin: '0 0 8px 0' }}>
          Financial News
        </h1>
        <p style={{ fontSize: '14px', color: '#000000', margin: 0 }}>
          Real-time market updates (Finnhub Free API)
        </p>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeFilter === filter ? '#1a1a1a' : '#ffffff',
              color: activeFilter === filter ? '#ffffff' : '#000000',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* News List */}
      {loading ? (
        <div style={{ 
          padding: '60px 20px', 
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <p style={{ fontSize: '15px', color: '#000000', fontWeight: '500' }}>Loading real-time news...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div style={{ 
          padding: '60px 20px', 
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
          <p style={{ fontSize: '15px', color: '#000000', fontWeight: '500' }}>
            No news found for this category
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNews.map((item) => (
            <a 
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div 
                style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'transform 0.2s ease'
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700',
                      color: '#000000',
                      backgroundColor: getCategoryColor(item.category),
                      padding: '4px 10px',
                      borderRadius: '8px',
                      textTransform: 'uppercase'
                    }}>
                      {item.category}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700',
                      color: '#000000',
                      backgroundColor: getImpactColor(item.impact),
                      padding: '4px 10px',
                      borderRadius: '8px',
                      textTransform: 'uppercase'
                    }}>
                      {item.impact} Impact
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: '600' }}>
                    {item.time}
                  </span>
                </div>

                {/* Card Body */}
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '800', 
                  color: '#000000',
                  margin: '0 0 8px 0',
                  lineHeight: '1.4'
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#000000',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {item.summary}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}