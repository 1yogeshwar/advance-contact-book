import React from 'react';
import { useNavigate } from 'react-router-dom';

function ContactsTable({ contacts, selectedIds, onSelectChange, onDelete, onSelectAll }) {
  const navigate = useNavigate();

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>
              <input 
                type="checkbox" 
                onChange={(e) => onSelectAll(e.target.checked)}
                checked={selectedIds.length === contacts.length && contacts.length > 0}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No contacts found
              </td>
            </tr>
          ) : (
            contacts.map(contact => (
              <tr key={contact._id}>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(contact._id)}
                    onChange={(e) => onSelectChange(contact._id, e.target.checked)}
                  />
                </td>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{contact.company || '-'}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-info me-2"
                    onClick={() => navigate(`/contacts/${contact._id}`)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(contact._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ContactsTable;