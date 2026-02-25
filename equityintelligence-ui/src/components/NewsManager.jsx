import React, { useState, useEffect } from 'react';
import IndustryService from './../services/IndustryService.js';
import CompanyService from './../services/CompanyService';
import NewsService from './../services/NewsService';
import MacroIndicatorService from '../services/MacroIndicatorService';

const API_URL = "http://localhost:8000/news/";

const NewsManager = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source_url: '',
    event_date: '',
    industry_ids: [],
    company_ids: [],
    macro_ids: [],
  });
  const [industries, setIndustries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [macros, setMacros] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [macroSearch, setMacroSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    IndustryService.getAll().then(data => setIndustries(data.sort((a, b) => a.name.localeCompare(b.name))));
    CompanyService.getAll().then(data => setCompanies(data.sort((a, b) => a.company_name.localeCompare(b.company_name))));
    // Use MacroIndicatorService to fetch macros
    MacroIndicatorService.getAll().then(data => setMacros(Array.isArray(data) ? data : []));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      setFormData({
        ...formData,
        [name]: Array.from(selectedOptions, option => option.value)
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    await NewsService.create({
      ...formData,
      summary: formData.content, // send as summary to backend
      event_date: formData.event_date || undefined,
      industry_ids: formData.industry_ids,
      company_ids: formData.company_ids,
      macro_ids: formData.macro_ids,
    });
    setSaving(false);
    setSuccess(true);
    setFormData({ title: '', summary: '', source_url: '', event_date: '', industry_ids: [], company_ids: [], macro_ids: [] });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">News & Events Entry</h2>
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium">News Title</label>
          <input
            className="border p-2 rounded w-full"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea
            className="border p-2 rounded w-full"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Source URL</label>
          <input
            className="border p-2 rounded w-full"
            name="source_url"
            value={formData.source_url}
            onChange={handleChange}
            type="url"
            placeholder="https://example.com/news"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Event Date</label>
          <input
            type="date"
            className="border p-2 rounded"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Companies (Multi-select)</label>
          <input
            type="text"
            className="border p-2 rounded w-full mb-1"
            placeholder="Search Companies"
            value={companySearch}
            onChange={e => setCompanySearch(e.target.value)}
          />
          <select
            name="company_ids"
            multiple
            className="border p-2 rounded w-full"
            value={formData.company_ids}
            onChange={handleChange}
          >
            {companies.filter(comp => comp.company_name.toLowerCase().includes(companySearch.toLowerCase())).map(comp => (
              <option key={comp.id} value={comp.id}>{comp.company_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Industries (Multi-select)</label>
          <input
            type="text"
            className="border p-2 rounded w-full mb-1"
            placeholder="Search Industries"
            value={industrySearch}
            onChange={e => setIndustrySearch(e.target.value)}
          />
          <select
            name="industry_ids"
            multiple
            className="border p-2 rounded w-full"
            value={formData.industry_ids}
            onChange={handleChange}
          >
            {industries.filter(ind => ind.name.toLowerCase().includes(industrySearch.toLowerCase())).map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Macros (Multi-select)</label>
          <input
            type="text"
            className="border p-2 rounded w-full mb-1"
            placeholder="Search Macros"
            value={macroSearch}
            onChange={e => setMacroSearch(e.target.value)}
          />
          <select
            name="macro_ids"
            multiple
            className="border p-2 rounded w-full"
            value={formData.macro_ids}
            onChange={handleChange}
          >
            {macros.filter(mac => mac.indicator_name.toLowerCase().includes(macroSearch.toLowerCase())).map(mac => (
              <option key={mac.id} value={mac.id}>{mac.indicator_name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>
          {saving ? 'Saving...' : 'Save News'}
        </button>
        {success && <div className="text-green-600">News saved successfully!</div>}
      </form>
    </div>
  );
};

export default NewsManager;
