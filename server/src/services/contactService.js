// services/contactService.js
const Contact = require('../models/Contact');

// Create a new contact
const createContact = async (data) => {
  try {
    const contact = new Contact(data);
    await contact.save();
    return contact;
  } catch (error) {
    throw error;
  }
};

// Get all contacts with pagination, search, filter, sort
const getContacts = async ({ page = 1, limit = 10, search = '', filter = {}, sort = {} }) => {
  try {
    const skip = (page - 1) * limit;
    
    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Add filters (e.g., { company: 'ABC Corp' })
    query = { ...query, ...filter };
    
    // Get contacts
    const contacts = await Contact.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Contact.countDocuments(query);
    
    return {
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw error;
  }
};

// Get single contact by ID
const getContactById = async (id) => {
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return contact;
  } catch (error) {
    throw error;
  }
};

// Update contact
const updateContact = async (id, data) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      throw new Error('Contact not found');
    }
    return contact;
  } catch (error) {
    throw error;
  }
};

// Delete single contact
const deleteContact = async (id) => {
  try {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return { message: 'Contact deleted successfully' };
  } catch (error) {
    throw error;
  }
};

// Batch delete contacts
const deleteContactsBatch = async (ids) => {
  try {
    const result = await Contact.deleteMany({ _id: { $in: ids } });
    return { deletedCount: result.deletedCount };
  } catch (error) {
    throw error;
  }
};

// Start editing (lock)
const startEdit = async (id, userId) => {
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    
    // Check if someone else is editing
    if (contact.isEditing && contact.editingUntil > Date.now() && contact.editingBy !== userId) {
      const error = new Error('Contact is being edited by another user');
      error.statusCode = 409;
      throw error;
    }
    
    // Lock for 10 minutes
    contact.isEditing = true;
    contact.editingBy = userId;
    contact.editingUntil = Date.now() + (10 * 60 * 1000);
    await contact.save();
    
    return contact;
  } catch (error) {
    throw error;
  }
};

// End editing (unlock)
const endEdit = async (id, userId) => {
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    
    // Only unlock if current user is the one editing
    if (contact.editingBy === userId) {
      contact.isEditing = false;
      contact.editingBy = null;
      contact.editingUntil = null;
      await contact.save();
    }
    
    return contact;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  deleteContactsBatch,
  startEdit,
  endEdit
};