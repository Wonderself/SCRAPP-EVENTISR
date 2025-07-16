import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import EventsTable from "./components/EventsTable";
import ScrapingControl from "./components/ScrapingControl";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", name: "Events Table", icon: "📋", description: "View scraped events" },
    { path: "/scraping", name: "Scraping Control", icon: "🔧", description: "Manage scraping jobs" }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🎭 Israeli Events Scraper
              </h1>
            </div>
            <div className="ml-6 flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    location.pathname === item.path
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-500">
              Aug - Sep 2025 Events
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Home = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    checkApiStatus();
    fetchStats();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await axios.get(`${API}/`);
      setApiStatus('connected');
    } catch (e) {
      console.error('API connection error:', e);
      setApiStatus('disconnected');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/events/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🎭 מערכת איסוף אירועים תרבותיים
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  מערכת לאיסוף וניהול אירועים תרבותיים וציבוריים מאתרים מובילים בישראל
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  API {apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Events
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total_events || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">⭐</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      High Priority
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.by_importance?.high || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🇮🇱</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Hebrew Events
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.by_language?.hebrew || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🌐</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Sources
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.keys(stats.by_source || {}).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/scraping"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-3xl mr-4">🔧</div>
                <div>
                  <h4 className="text-lg font-medium text-blue-900">Start Scraping</h4>
                  <p className="text-sm text-blue-700">
                    Launch scraping jobs to collect new events
                  </p>
                </div>
              </Link>
              
              <Link
                to="/"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-3xl mr-4">📋</div>
                <div>
                  <h4 className="text-lg font-medium text-green-900">View Events</h4>
                  <p className="text-sm text-green-700">
                    Browse and export collected events
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sources Overview */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Supported Sources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'Eventbrite', icon: '🎪', url: 'eventbrite.com', count: stats.by_source?.eventbrite || 0 },
                { name: 'Matkonet', icon: '🇮🇱', url: 'matkonet.co.il', count: stats.by_source?.matkonet || 0 },
                { name: 'GetOut', icon: '🎭', url: 'getout.co.il', count: stats.by_source?.getout || 0 },
                { name: 'Habama', icon: '🎭', url: 'habama.co.il', count: stats.by_source?.habama || 0 },
                { name: 'Funzing', icon: '🎪', url: 'funzing.com', count: stats.by_source?.funzing || 0 }
              ].map((source) => (
                <div key={source.name} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">{source.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{source.name}</div>
                  <div className="text-xs text-gray-500">{source.url}</div>
                  <div className="text-lg font-bold text-blue-600 mt-2">{source.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<EventsTable />} />
          <Route path="/scraping" element={<ScrapingControl />} />
          <Route path="/overview" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
