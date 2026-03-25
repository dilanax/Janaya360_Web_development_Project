import React, { useEffect, useState } from 'react';
import axios from 'axios';

const C = {
  parliament: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
};

const mapLiveArticle = (article, index) => ({
  id: article.url || `live-${index}`,
  title: article.title || 'Untitled news item',
  description: article.description || 'No description available.',
  source: article.source?.name || 'Live News Feed',
  image: article.image || `https://picsum.photos/seed/live-news-${index}/640/360`,
  url: article.url || '',
  publishedAt: article.publishedAt || '',
  politician: article.source?.name || 'Sri Lanka Politics',
  isLive: true,
});

const mapDatabaseArticle = (article) => ({
  id: article._id,
  title: article.title || 'Untitled news item',
  description: article.description || 'No description available.',
  source: article.source || 'Admin News',
  image: article.image || `https://picsum.photos/seed/db-news-${article._id}/640/360`,
  url: article.url || '',
  publishedAt: article.publishedAt || '',
  politician: article.politician || 'General',
  isLive: false,
});

const formatDate = (value) => {
  if (!value) return 'Latest';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Latest';
  return date.toLocaleDateString();
};

const NewsCard = ({ item }) => (
  <article
    style={{
      background: '#fff',
      border: `1px solid ${C.gray[200]}`,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ height: 200, background: C.gray[100] }}>
      <img
        src={item.image}
        alt={item.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(event) => {
          event.currentTarget.src = `https://picsum.photos/seed/fallback-${item.id}/640/360`;
        }}
      />
    </div>
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            background: item.isLive ? C.parliament[600] : C.parliament[50],
            color: item.isLive ? '#fff' : C.parliament[800],
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {item.isLive ? 'Live News' : 'Admin News'}
        </span>
        <span style={{ fontSize: 12, color: C.gray[500] }}>{formatDate(item.publishedAt)}</span>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: C.parliament[700] }}>{item.source}</div>

      <h3 style={{ fontSize: 20, fontWeight: 800, color: C.gray[900], lineHeight: 1.35, margin: 0 }}>
        {item.title}
      </h3>

      <p style={{ fontSize: 14, color: C.gray[700], lineHeight: 1.65, margin: 0, flex: 1 }}>
        {item.description}
      </p>

      <div style={{ fontSize: 13, color: C.gray[500] }}>{item.politician}</div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '11px 14px',
            borderRadius: 10,
            background: C.parliament[600],
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Read Article
        </a>
      )}
    </div>
  </article>
);

const News = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [liveNews, setLiveNews] = useState([]);
  const [adminNews, setAdminNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError('');

      try {
        const liveResponse = await axios.get(`${API_URL}/api/news/social/trends`);
        const liveArticles = Array.isArray(liveResponse.data?.articles)
          ? liveResponse.data.articles.map(mapLiveArticle)
          : [];

        setLiveNews(liveArticles);
      } catch (liveError) {
        setLiveNews([]);
        setError(liveError.response?.data?.message || 'Live news is unavailable right now.');
      }

      try {
        const adminResponse = await axios.get(`${API_URL}/api/news/public`);
        const manualArticles = Array.isArray(adminResponse.data)
          ? adminResponse.data.map(mapDatabaseArticle)
          : [];

        setAdminNews(manualArticles);
      } catch (manualError) {
        setAdminNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [API_URL]);

  const primaryNews = liveNews.length > 0 ? liveNews : adminNews;

  return (
    <div style={{ background: C.gray[50], minHeight: '100vh', padding: '48px 24px 72px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: C.parliament[50],
              border: `1px solid ${C.parliament[200]}`,
              color: C.parliament[800],
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Public News Feed
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: C.gray[900], margin: '0 0 8px' }}>
            Latest Political News
          </h1>
          <p style={{ color: C.gray[500], margin: 0, maxWidth: 700, lineHeight: 1.7 }}>
            This page now prefers real live news from the third-party API. If live news is unavailable, it falls back to the news created in the admin dashboard.
          </p>
        </div>

        {isLoading && <p style={{ color: C.gray[500] }}>Loading news...</p>}

        {!isLoading && error && liveNews.length === 0 && adminNews.length > 0 && (
          <div
            style={{
              marginBottom: 20,
              padding: '14px 16px',
              borderRadius: 14,
              background: '#FFF7ED',
              border: `1px solid ${C.parliament[200]}`,
              color: C.parliament[800],
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Live news is unavailable right now, so showing admin-published news instead.
          </div>
        )}

        {!isLoading && error && liveNews.length === 0 && adminNews.length === 0 && (
          <div
            style={{
              marginBottom: 20,
              padding: '14px 16px',
              borderRadius: 14,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
          {primaryNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {!isLoading && primaryNews.length === 0 && (
          <p style={{ color: C.gray[500], marginTop: 20 }}>No news available yet.</p>
        )}
      </div>
    </div>
  );
};

export default News;
