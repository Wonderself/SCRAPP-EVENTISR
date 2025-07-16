import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ScrapingControl = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrapingStatus, setScrapingStatus] = useState({});

  const sources = [
    { key: 'eventbrite', name: 'Eventbrite', icon: '🎪', description: 'Global events platform' },
    { key: 'matkonet', name: 'Matkonet', icon: '🇮🇱', description: 'Israeli lifestyle magazine' },
    { key: 'getout', name: 'GetOut', icon: '🎭', description: 'Israeli activities platform' },
    { key: 'habama', name: 'Habama', icon: '🎭', description: 'Israeli theater platform' },
    { key: 'funzing', name: 'Funzing', icon: '🎪', description: 'Experiences platform' }
  ];

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/events/jobs`);
      setJobs(response.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const startScrapingAll = async () => {
    setLoading(true);
    setError(null);
    setScrapingStatus({ all: 'starting' });

    try {
      const response = await axios.post(`${API}/events/scrape/all`);
      setScrapingStatus({ all: 'started' });
      
      // Show success message
      setTimeout(() => {
        setScrapingStatus({});
        fetchJobs();
      }, 3000);
      
    } catch (err) {
      console.error('Error starting scraping:', err);
      setError('Failed to start scraping. Please try again.');
      setScrapingStatus({});
    } finally {
      setLoading(false);
    }
  };

  const startScrapingSource = async (source) => {
    setLoading(true);
    setError(null);
    setScrapingStatus({ [source]: 'starting' });

    try {
      const response = await axios.post(`${API}/events/scrape/${source}`);
      setScrapingStatus({ [source]: 'started' });
      
      // Show success message
      setTimeout(() => {
        setScrapingStatus({});
        fetchJobs();
      }, 3000);
      
    } catch (err) {
      console.error(`Error starting scraping for ${source}:`, err);
      setError(`Failed to start scraping for ${source}. Please try again.`);
      setScrapingStatus({});
    } finally {
      setLoading(false);
    }
  };

  const getJobStatus = (source) => {
    const recentJobs = jobs.filter(job => job.source === source)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return recentJobs.length > 0 ? recentJobs[0] : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('he-IL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 בקרת איסוף נתונים
          </h1>
          <p className="text-gray-600">
            הפעל וניהל את תהליכי איסוף האירועים מהאתרים השונים
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Main Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              בקרת איסוף כללי
            </h2>
            <button
              onClick={startScrapingAll}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
            >
              {scrapingStatus.all === 'starting' ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Starting...</span>
                </div>
              ) : scrapingStatus.all === 'started' ? (
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Started Successfully!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🚀</span>
                  <span>Start Scraping All Sources</span>
                </div>
              )}
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-600">ℹ️</span>
              <span className="font-medium text-blue-900">איסוף כללי</span>
            </div>
            <p className="text-blue-800 text-sm">
              פעולה זו תפעיל את כל 5 המקורות במקביל ותאסוף עד 250 אירועים הכי חשובים מחודש אוגוסט וספטמבר 2025.
              התהליך יכול לקחת מספר דקות.
            </p>
          </div>
        </div>

        {/* Individual Source Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            בקרת מקורות פרטניים
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source) => {
              const job = getJobStatus(source.key);
              const currentStatus = scrapingStatus[source.key];
              
              return (
                <div key={source.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{source.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{source.name}</h3>
                      <p className="text-sm text-gray-600">{source.description}</p>
                    </div>
                  </div>

                  {/* Job Status */}
                  {job && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)} {job.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(job.created_at)}
                        </span>
                      </div>
                      
                      {job.status === 'completed' && (
                        <div className="text-sm text-green-600">
                          Found {job.successful_events} events
                        </div>
                      )}
                      
                      {job.status === 'failed' && job.errors && job.errors.length > 0 && (
                        <div className="text-sm text-red-600">
                          {job.errors[0].substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Control Button */}
                  <button
                    onClick={() => startScrapingSource(source.key)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    {currentStatus === 'starting' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Starting...</span>
                      </div>
                    ) : currentStatus === 'started' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <span>✅</span>
                        <span>Started!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>🚀</span>
                        <span>Start Scraping</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            מטלות איסוף אחרונות
          </h2>
          
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>No scraping jobs yet. Start scraping to see job history.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מקור
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      אירועים
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      זמן יצירה
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      זמן השלמה
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.slice(0, 10).map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {sources.find(s => s.key === job.source)?.icon || '📄'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {job.source}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)} {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.successful_events} / {job.total_events}
                        {job.failed_events > 0 && (
                          <span className="text-red-600 ml-2">
                            ({job.failed_events} failed)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.completed_at ? formatDate(job.completed_at) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapingControl;