import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContactById, updateContact, deleteContact, startEdit, endEdit } from '../api/contactsApi';

function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const userId = 'user123'; // In real app, get from auth

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await getContactById(id);
      setContact(response.data);
      setFormData(response.data);
    } catch (error) {
      alert('Failed to load contact');
      navigate('/contacts');
    }
  };

  const handleEdit = async () => {
    try {
      await startEdit(id, userId);
      setIsEditing(true);
    } catch (error) {
      if (error.response?.status === 409) {
        alert('This contact is being edited by another user. Please try again later.');
      } else {
        alert('Failed to start editing');
      }
    }
  };

  const handleCancel = async () => {
    await endEdit(id, userId);
    setIsEditing(false);
    setFormData(contact);
  };

  const handleSave = async () => {
    try {
      await updateContact(id, formData);
      await endEdit(id, userId);
      setIsEditing(false);
      fetchContact();
      alert('Contact updated successfully');
    } catch (error) {
      alert('Failed to update contact');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        alert('Contact deleted');
        navigate('/contacts');
      } catch (error) {
        alert('Failed to delete contact');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!contact) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>Contact Details</h4>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/contacts')}
              >
                Back to List
              </button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Name</label>
                <input 
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input 
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Phone</label>
                <input 
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Company</label>
                <input 
                  type="text"
                  className="form-control"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Address</label>
                <textarea 
                  className="form-control"
                  name="address"
                  rows="3"
                  value={formData.address || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="d-flex gap-2">
                {!isEditing ? (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={handleEdit}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactDetailPage;