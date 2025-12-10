const XLSX = require('xlsx');

const parseExcel = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with defval to handle empty cells
    const rows = XLSX.utils.sheet_to_json(sheet, { 
      defval: '',
      raw: false  // Convert everything to strings
    });
    
    console.log('Parsed rows:', rows); // Debug log
    return rows;
  } catch (error) {
    throw new Error('Failed to parse Excel file');
  }
};


const validateRows = (rows) => {
  const validRows = [];
  const errorRows = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

  rows.forEach((row, index) => {
    const errors = [];
    const rowNumber = index + 2;

    // Normalize field names (handle case variations)
    const normalizedRow = {
      name: row.Name || row.name || '',
      email: row.Email || row.email || '',
      phone: row.Phone || row.phone || '',
      company: row.Company || row.company || '',
      address: row.Address || row.address || ''
    };

    // Check required fields
    if (!normalizedRow.name || normalizedRow.name.trim() === '') {
      errors.push('Name is required');
    }
    if (!normalizedRow.email || normalizedRow.email.trim() === '') {
      errors.push('Email is required');
    }
    if (!normalizedRow.phone || normalizedRow.phone.toString().trim() === '') {
      errors.push('Phone is required');
    }

    // Validate email format
    if (normalizedRow.email && !emailRegex.test(normalizedRow.email)) {
      errors.push('Invalid email format');
    }

    if (normalizedRow.phone) {
      const cleanPhone = normalizedRow.phone.toString().replace(/[\s\-\(\)]/g, '');
      if (cleanPhone.length < 10) {
        errors.push('Phone must be at least 10 digits');
      }
    }

    // If errors exist, add to errorRows
    if (errors.length > 0) {
      errorRows.push({
        row: rowNumber,
        data: normalizedRow,
        errors: errors
      });
    } else {
      

      //clean and add
      validRows.push({
        name: normalizedRow.name.trim(),
        email: normalizedRow.email.trim().toLowerCase(),
        phone: normalizedRow.phone.toString().trim(),
        company: normalizedRow.company ? normalizedRow.company.trim() : '',
        address: normalizedRow.address ? normalizedRow.address.trim() : ''
      });
    }
  });

  console.log('Valid rows:', validRows.length);
  console.log('Error rows:', errorRows.length);

  return { validRows, errorRows };
};


const createErrorReport = (errorRows) => {
  const reportData = errorRows.map(err => ({
    'Row Number': err.row,
    'Name': err.data.name || '',
    'Email': err.data.email || '',
    'Phone': err.data.phone || '',
    'Company': err.data.company || '',
    'Address': err.data.address || '',
    'Errors': err.errors.join(', ')
  }));

  const worksheet = XLSX.utils.json_to_sheet(reportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};


const generateExportFile = (contacts, selectedFields = []) => {
  const fields = selectedFields.length > 0 
    ? selectedFields 
    : ['name', 'email', 'phone', 'company', 'address'];

  const exportData = contacts.map(contact => {
    const row = {};
    fields.forEach(field => {
      row[field.charAt(0).toUpperCase() + field.slice(1)] = contact[field] || '';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

module.exports = {
  parseExcel,
  validateRows,
  createErrorReport,
  generateExportFile
};