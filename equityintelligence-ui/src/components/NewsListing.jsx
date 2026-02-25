import React, { useEffect, useState } from 'react';
import NewsService from './../services/NewsService';
import IndustryService from './../services/IndustryService.js';
import CompanyService from './../services/CompanyService';
import MacroIndicatorService from '../services/MacroIndicatorService';

const NewsListing = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [industries, setIndustries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [macros, setMacros] = useState([]);
  const [filters, setFilters] = useState({ industry: '', company: '', macro: '' });
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNews, setModalNews] = useState(null);

  useEffect(() => {
    NewsService.getAll().then(setNews);
    IndustryService.getAll().then(setIndustries);
    CompanyService.getAll().then(setCompanies);
    MacroIndicatorService.getAll().then(data => setMacros(Array.isArray(data) ? data : []));
  }, []);

  // Filtering
  const filteredNews = news.filter(item => {
    const industryMatch = !filters.industry || item.industries.some(i => i.id === filters.industry);
    const companyMatch = !filters.company || item.companies.some(c => c.id === filters.company);
    const macroMatch = !filters.macro || item.macros.some(m => m.id === filters.macro);
    // Search filter
    const searchLower = search.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(searchLower);
    const summaryMatch = (item.summary || '').toLowerCase().includes(searchLower);
    const companiesMatch = item.companies.some(c => c.company_name.toLowerCase().includes(searchLower));
    const industriesMatch = item.industries.some(i => i.name.toLowerCase().includes(searchLower));
    const macrosMatch = item.macros.some(m => m.indicator_name.toLowerCase().includes(searchLower));
    const dateMatch = (item.event_date || '').toLowerCase().includes(searchLower);
    return industryMatch && companyMatch && macroMatch && (titleMatch || summaryMatch || companiesMatch || industriesMatch || macrosMatch || dateMatch);
  });

  // Sorting
  const sortedNews = [...filteredNews].sort((a, b) => {
    let aField, bField;
    if (sortField === 'title') {
      aField = a.title.toLowerCase();
      bField = b.title.toLowerCase();
    } else if (sortField === 'date') {
      aField = a.event_date;
      bField = b.event_date;
    } else {
      aField = '';
      bField = '';
    }
    if (sortOrder === 'asc') {
      return aField > bField ? 1 : aField < bField ? -1 : 0;
    } else {
      return aField < bField ? 1 : aField > bField ? -1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedNews.length / pageSize);
  const pagedNews = sortedNews.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">News & Events Listing</h2>
      <div className="flex gap-4 mb-6">
        <select className="border p-2 rounded" value={filters.industry} onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))}>
          <option value="">All Industries</option>
          {industries.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={filters.company} onChange={e => setFilters(f => ({ ...f, company: e.target.value }))}>
          <option value="">All Companies</option>
          {companies.map(comp => <option key={comp.id} value={comp.id}>{comp.company_name}</option>)}
        </select>
        <select className="border p-2 rounded" value={filters.macro} onChange={e => setFilters(f => ({ ...f, macro: e.target.value }))}>
          <option value="">All Macros</option>
          {macros.map(mac => <option key={mac.id} value={mac.id}>{mac.indicator_name}</option>)}
        </select>
      </div>
      {/* Search box for table */}
      <div className="mb-4">
        <input
          type="text"
          className="border p-2 rounded w-96"
          placeholder="Search Title, Companies, Industries, Macros, Date"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('title')}>
              Title {sortField === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-left whitespace-nowrap cursor-pointer" onClick={() => handleSort('date')}>
              Date {sortField === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-left">Companies</th>
            <th className="border p-2 text-left">Industries</th>
            <th className="border p-2 text-left">Macros</th>
          </tr>
        </thead>
        <tbody>
          {pagedNews.map(item => (
            <tr key={item.id}>
              <td className="border p-2 font-semibold">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => { setModalNews(item); setModalOpen(true); }}
                >
                  {item.title}
                </button>
              </td>
              <td className="border p-2 whitespace-nowrap">{item.event_date}</td>
              <td className="border p-2 text-sm">{item.companies.map(c => c.company_name).join(', ')}</td>
              <td className="border p-2 text-sm">{item.industries.map(i => i.name).join(', ')}</td>
              <td className="border p-2 text-sm">{item.macros.map(m => m.indicator_name).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Paging Controls */}
      {sortedNews.length > 0 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <span className="flex items-center gap-2">
            <span
              className={`cursor-pointer px-2 ${page === 1 ? 'text-gray-400' : 'text-blue-600'}`}
              onClick={() => page > 1 && setPage(1)}
              aria-label="First Page"
            >&lt;&lt;</span>
            <span
              className={`cursor-pointer px-2 ${page === 1 ? 'text-gray-400' : 'text-blue-600'}`}
              onClick={() => page > 1 && setPage(page - 1)}
              aria-label="Previous Page"
            >&lt;</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={e => {
                let val = Number(e.target.value);
                if (val >= 1 && val <= totalPages) setPage(val);
              }}
              className="border rounded w-12 text-center mx-2"
              style={{ width: '2.5rem' }}
            />
            <span>of {totalPages}</span>
            <span
              className={`cursor-pointer px-2 ${page === totalPages || totalPages === 0 ? 'text-gray-400' : 'text-blue-600'}`}
              onClick={() => page < totalPages && setPage(page + 1)}
              aria-label="Next Page"
            >&gt;</span>
            <span
              className={`cursor-pointer px-2 ${page === totalPages || totalPages === 0 ? 'text-gray-400' : 'text-blue-600'}`}
              onClick={() => page < totalPages && setPage(totalPages)}
              aria-label="Last Page"
            >&gt;&gt;</span>
          </span>
        </div>
      )}
      {/* Modal Dialog */}
      {modalOpen && modalNews && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">{modalNews.title}</h3>
            <div className="text-gray-700 mb-2">{modalNews.summary}</div>
            <div className="text-sm text-gray-500">{modalNews.event_date}</div>
            {modalNews.source_url && (
              <div className="mt-4 text-sm">
                <span className="font-semibold mr-2">Source:</span>
                <a href={modalNews.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{modalNews.source_url}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsListing;
