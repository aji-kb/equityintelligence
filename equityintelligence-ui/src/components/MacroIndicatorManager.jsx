import React, { useEffect, useState } from 'react';
import MacroIndicatorService from '../services/MacroIndicatorService';

const MacroIndicatorManager = () => {
  const [macroIndicators, setMacroIndicators] = useState([]);
  const [sortField, setSortField] = useState('indicator_name');
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

    // Filter, sort, and page macro indicators
    const filteredIndicators = macroIndicators
      .filter(ind =>
        ind.indicator_name.toLowerCase().includes(search.toLowerCase()) ||
        (ind.category || '').toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        let aField, bField;
        if (sortField === 'indicator_name') {
          aField = a.indicator_name.toLowerCase();
          bField = b.indicator_name.toLowerCase();
        } else if (sortField === 'category') {
          aField = (a.category || '').toLowerCase();
          bField = (b.category || '').toLowerCase();
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
    const totalPages = Math.ceil(filteredIndicators.length / pageSize);
    const pagedIndicators = filteredIndicators.slice((page - 1) * pageSize, page * pageSize);
  const [formData, setFormData] = useState({ indicator_name: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this macro indicator? This action cannot be undone.')) {
      await MacroIndicatorService.delete(id);
      fetchMacroIndicators();
    }
  };

  const fetchMacroIndicators = async () => {
    const data = await MacroIndicatorService.getAll();
    setMacroIndicators(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchMacroIndicators();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await MacroIndicatorService.update(editingId, formData);
    } else {
      await MacroIndicatorService.create(formData);
    }
    setFormData({ indicator_name: '', category: '' });
    setEditingId(null);
    fetchMacroIndicators();
  };

  const handleEdit = (indicator) => {
    setFormData({ indicator_name: indicator.indicator_name, category: indicator.category || '' });
    setEditingId(indicator.id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Macro Indicator Manager</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-2">
          <label className="block mb-1">Indicator Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={formData.indicator_name}
            onChange={e => setFormData(f => ({ ...f, indicator_name: e.target.value }))}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Category</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={formData.category}
            onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? 'Update' : 'Add'} Macro Indicator
        </button>
      </form>
      {/* Search and Paging Controls */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          className="border p-2 rounded"
          style={{ width: '32rem' }}
          placeholder="Search by Indicator Name or Category"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('indicator_name')}>
              Indicator Name {sortField === 'indicator_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('category')}>
              Category {sortField === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedIndicators.map(indicator => (
            <tr key={indicator.id}>
              <td className="border p-2">{indicator.indicator_name}</td>
              <td className="border p-2">{indicator.category}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(indicator)}
                  title="Edit"
                  style={{ color: '#2563eb', fontSize: '18px', marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  &#9998;
                </button>
                <button
                  onClick={() => handleDelete(indicator.id)}
                  title="Delete"
                  style={{ color: '#dc2626', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}
                >
                  &#10006;
                </button>
              </td>
            </tr>
          ))}
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

export default MacroIndicatorManager;
