import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import IndustryManager from './components/IndustryManager';
import CompanyManager from './components/CompanyManager';
import NewsManager from './components/NewsManager';
import NewsListing from './components/NewsListing';
import MacroIndicatorManager from './components/MacroIndicatorManager';

const Dashboard = () => <div className="p-6">Welcome to EquityIntelligence. Select a module to begin.</div>;

const App = () => {
  const [newsMenuOpen, setNewsMenuOpen] = useState(false);
  let newsMenuTimeout = null;
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* TOP NAVIGATION BAR */}
        <nav className="flex items-center bg-slate-900 text-white px-8 py-3 shadow">
          <div className="text-2xl font-bold mr-8">Equity Intelligence </div>
          <Link to="/" className="px-4 py-2 hover:bg-slate-800 rounded transition">🏠 Dashboard</Link>
          <Link to="/macro-indicators" className="px-4 py-2 hover:bg-slate-800 rounded transition">📈 Macro Indicator</Link>
          <Link to="/industries" className="px-4 py-2 hover:bg-slate-800 rounded transition">🏭 Industry Hierarchy</Link>
          <Link to="/companies" className="px-4 py-2 hover:bg-slate-800 rounded transition">🏢 Company Master</Link>
          <div
            className="relative ml-4"
            onMouseEnter={() => {
              clearTimeout(newsMenuTimeout);
              setNewsMenuOpen(true);
            }}
            onMouseLeave={() => {
              newsMenuTimeout = setTimeout(() => setNewsMenuOpen(false), 100);
            }}
          >
            <button
              className="px-4 py-2 font-semibold focus:outline-none hover:bg-slate-800 rounded transition flex items-center"
              aria-expanded={newsMenuOpen}
            >
              <span>📰 News</span>
              <span className="ml-2">{newsMenuOpen ? '▼' : '▶'}</span>
            </button>
            {newsMenuOpen && (
              <div className="absolute left-0 mt-2 bg-slate-900 border border-slate-700 rounded shadow-lg z-10 flex flex-col w-48">
                <Link to="/news/add" className="px-4 py-2 hover:bg-slate-800 rounded-t transition">Add/Edit News</Link>
                <Link to="/news/list" className="px-4 py-2 hover:bg-slate-800 rounded-b transition">Listing</Link>
              </div>
            )}
          </div>
          <div className="ml-auto text-sm text-slate-400">Postgres Connected 🟢</div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/macro-indicators" element={<MacroIndicatorManager />} />
              <Route path="/industries" element={<IndustryManager />} />
              <Route path="/companies" element={<CompanyManager />} />
              <Route path="/news/add" element={<NewsManager />} />
              <Route path="/news/list" element={<NewsListing />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;