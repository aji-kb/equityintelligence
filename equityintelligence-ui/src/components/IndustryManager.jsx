import React, { useState, useEffect } from 'react';
import IndustryService from './../services/IndustryService.js';


const IndustryManager = () => {
  const [industries, setIndustries] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [formData, setFormData] = useState({ name: '', description: '', parent_id: '' });
  const [editingId, setEditingId] = useState(null);

 const loadIndustries = async () => {
   const data = await IndustryService.getAll();
   // Default sort by name ascending
   setIndustries(data.sort((a, b) => a.name.localeCompare(b.name)));
 };
  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page on sort
  };
  // Filter, sort, and page industries
  const filteredIndustries = industries
    .filter(ind => {
      const parentName = ind.parent_id ? (industries.find(i => i.id === ind.parent_id)?.name || '') : '';
      return (
        ind.name.toLowerCase().includes(search.toLowerCase()) ||
        parentName.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      let aField = sortField === 'parent' ? (a.parent_id ? (industries.find(i => i.id === a.parent_id)?.name || '') : '') : a.name;
      let bField = sortField === 'parent' ? (b.parent_id ? (industries.find(i => i.id === b.parent_id)?.name || '') : '') : b.name;
      if (sortOrder === 'asc') {
        return aField.localeCompare(bField);
      } else {
        return bField.localeCompare(aField);
      }
    });
  const totalPages = Math.ceil(filteredIndustries.length / pageSize);
  const pagedIndustries = filteredIndustries.slice((page - 1) * pageSize, page * pageSize);

  // Load industries on component mount
  useEffect(() => {
    loadIndustries();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clean parent_id if it's an empty string (FastAPI expects UUID or null)
    const payload = { ...formData, parent_id: formData.parent_id || null };

    if (editingId) {
      await IndustryService.update(editingId, payload);
    } else {
      await IndustryService.create(payload);
    }
    
    setFormData({ name: '', description: '', parent_id: '' });
    setEditingId(null);
    loadIndustries(); // Refresh list
  };

  const handleEdit = (industry) => {
    setEditingId(industry.id);
    setFormData({ 
      name: industry.name, 
      description: industry.description || '', 
      parent_id: industry.parent_id || '' 
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Industry Manager</h2>
      
      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Industry Name</label>
          <input 
            className="border p-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Parent Sector</label>
          <select 
            className="border p-2 rounded"
            value={formData.parent_id}
            onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
          >
            <option value="">None (Top Level)</option>
            {industries.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? 'Update' : 'Add Industry'}
        </button>
      </form>

      {/* Search Control */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          className="border p-2 rounded w-64"
          placeholder="Search by Name or Parent Industry"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      {/* Industry Table with sortable headers */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
              Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-left cursor-pointer" onClick={() => handleSort('parent')}>
              Parent Industry {sortField === 'parent' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedIndustries.map((ind) => {
            let parentName = '';
            if (ind.parent_id) {
              const parent = industries.find(i => i.id === ind.parent_id);
              parentName = parent ? parent.name : ind.parent_id;
            }
            return (
              <tr key={ind.id}>
                <td className="border p-2 font-semibold">{ind.name}</td>
                <td className="border p-2 text-gray-500 text-sm">{parentName}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleEdit(ind)}
                    title="Edit"
                    style={{ color: '#2563eb', fontSize: '18px', marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    &#9998;
                  </button>
                  <button
                    onClick={async () => {
                      await IndustryService.delete(ind.id);
                      loadIndustries();
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

export default IndustryManager;