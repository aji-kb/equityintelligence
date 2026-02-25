import React, { useState, useEffect } from 'react';
import CompanyService from './../services/CompanyService';
import IndustryService from './../services/IndustryService.js';


const CompanyManager = () => {
  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [sortField, setSortField] = useState('company_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
    // Sorting handler
    const handleSort = (field) => {
      if (sortField === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortOrder('asc');
      }
      setPage(1);
    };

    // Filter, sort, and page companies
    const filteredCompanies = companies
      .filter(comp => {
        const industry = industries.find(i => i.id === comp.base_industry_id);
        return (
          comp.ticker.toLowerCase().includes(search.toLowerCase()) ||
          comp.company_name.toLowerCase().includes(search.toLowerCase()) ||
          (industry && industry.name.toLowerCase().includes(search.toLowerCase()))
        );
      })
      .sort((a, b) => {
        let aField, bField;
        if (sortField === 'ticker') {
          aField = a.ticker.toLowerCase();
          bField = b.ticker.toLowerCase();
        } else if (sortField === 'company_name') {
          aField = a.company_name.toLowerCase();
          bField = b.company_name.toLowerCase();
        } else if (sortField === 'industry') {
          aField = (industries.find(i => i.id === a.base_industry_id)?.name || '').toLowerCase();
          bField = (industries.find(i => i.id === b.base_industry_id)?.name || '').toLowerCase();
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
    const totalPages = Math.ceil(filteredCompanies.length / pageSize);
    const pagedCompanies = filteredCompanies.slice((page - 1) * pageSize, page * pageSize);
  const [formData, setFormData] = useState({ ticker: '', company_name: '', base_industry_id: '' });
  const [editingId, setEditingId] = useState(null);

  const loadCompanies = async () => {
    const data = await CompanyService.getAll();
    setCompanies(data);
  };

  const loadIndustries = async () => {
    const data = await IndustryService.getAll();
    setIndustries(data);
  };

  useEffect(() => {
    loadCompanies();
    loadIndustries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, base_industry_id: formData.base_industry_id || null };
    if (editingId) {
      await CompanyService.update(editingId, payload);
    } else {
      await CompanyService.create(payload);
    }
    setFormData({ ticker: '', company_name: '', base_industry_id: '' });
    setEditingId(null);
    loadCompanies();
  };

  const handleEdit = (company) => {
    setEditingId(company.id);
    setFormData({
      ticker: company.ticker,
      company_name: company.company_name,
      base_industry_id: company.base_industry_id || ''
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Company Manager</h2>
      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Ticker</label>
          <input
            className="border p-2 rounded"
            value={formData.ticker}
            onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Company Name</label>
          <input
            className="border p-2 rounded"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Industry</label>
          <select
            className="border p-2 rounded"
            value={formData.base_industry_id}
            onChange={(e) => setFormData({ ...formData, base_industry_id: e.target.value })}
          >
            <option value="">Select Industry</option>
            {industries.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? 'Update' : 'Add Company'}
        </button>
      </form>
      {/* Search and Paging Controls */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          className="border p-2 rounded w-64"
          placeholder="Search by Ticker, Company Name, or Industry"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      {/* Company Table with sortable headers */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('ticker')}>
              Ticker {sortField === 'ticker' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('company_name')}>
              Company Name {sortField === 'company_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('industry')}>
              Industry {sortField === 'industry' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedCompanies.map((comp) => {
            const industry = industries.find(i => i.id === comp.base_industry_id);
            return (
              <tr key={comp.id}>
                <td className="border p-2 font-semibold">{comp.ticker}</td>
                <td className="border p-2">{comp.company_name}</td>
                <td className="border p-2 text-gray-500 text-sm">{industry ? industry.name : 'N/A'}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleEdit(comp)}
                    title="Edit"
                    style={{ color: '#2563eb', fontSize: '18px', marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    &#9998;
                  </button>
                  <button
                    onClick={async () => {
                      await CompanyService.delete(comp.id);
                      loadCompanies();
                    }}
                    title="Delete"
                    style={{ color: '#dc2626', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    &#10006;
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Paging Controls */}
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
    </div>
  );
};

export default CompanyManager;
