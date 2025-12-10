import React, { useState, useEffect } from 'react';
import ContactsTable from '../components/ContactsTable';
import UploadContacts from '../components/UploadContacts';
import { getContacts, deleteContact, deleteContactsBatch, exportContacts } from '../api/contactsApi';

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [page, search]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await getContacts({ page, limit: 10, search });
      setContacts(response.data.contacts);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        fetchContacts();
      } catch (error) {
        alert('Failed to delete contact');
      }
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select contacts to delete');
      return;
    }
    
    if (window.confirm(`Delete ${selectedIds.length} contacts?`)) {
      try {
        await deleteContactsBatch(selectedIds);
        setSelectedIds([]);
        fetchContacts();
      } catch (error) {
        alert('Failed to delete contacts');
      }
    }
  };

  const handleExport = async () => {
    try {
      const params = selectedIds.length > 0 
        ? { ids: selectedIds.join(',') } 
        : {};
      
      const response = await exportContacts(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export contacts');
    }
  };

  const handleSelectChange = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(contacts.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Contact Book</h2>
      </div>

      <UploadContacts onUploadSuccess={fetchContacts} />

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <input 
                type="text"
                className="form-control"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={handleSearch}
              />
            </div>
            <div className="col-md-6 text-end">
              <button 
                className="btn btn-warning me-2"
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}
              >
                Delete Selected ({selectedIds.length})
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleExport}
              >
                Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'All'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <ContactsTable 
              contacts={contacts}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
              onDelete={handleDelete}
              onSelectAll={handleSelectAll}
            />
          )}

          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactsPage;