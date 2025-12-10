const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: false
  },
  company: {
    type: String,
    required: false,
  },
//editing 
  isEditing: {
    type: Boolean,
    default: false
  },
  editingBy: {
    type: String,
    default: null
  },
  editingUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Contact', contactSchema);