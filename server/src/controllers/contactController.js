const contactService = require('../services/contactService');
const excelService = require('../services/excelService');

//create
const createContact = async (req, res) => {
  try {
    const contact = await contactService.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const { page, limit, search, sort } = req.query;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    
    const result = await contactService.getContacts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || '',
      filter,
      sort: sort || 'name'
    });
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//contact single
const getContactById = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id);
    res.status(200).json(contact);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

//update cont
const updateContact = async (req, res) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.body);
    res.status(200).json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//delete cont
const deleteContact = async (req, res) => {
  try {
    const result = await contactService.deleteContact(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

//delete batch
const deleteContactsBatch = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of IDs' });
    }
    
    const result = await contactService.deleteContactsBatch(ids);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//edit lock
const startEdit = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const contact = await contactService.startEdit(req.params.id, userId);
    res.status(200).json(contact);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};


const endEdit = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const contact = await contactService.endEdit(req.params.id, userId);
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//upload excel
const uploadContacts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file format. Only .xlsx and .xls allowed' });
    }

    const rows = excelService.parseExcel(req.file.buffer); //parse file 

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const { validRows, errorRows } = excelService.validateRows(rows);

    if (errorRows.length > 0) {
      return res.status(400).json({
        message: 'Validation errors found',
        totalRows: rows.length,
        validRows: validRows.length,
        errorRows: errorRows.length,
        errors: errorRows
      });
    }

    const insertedContacts = [];
    const duplicateErrors = [];

    for (let i = 0; i < validRows.length; i++) {
      try {
        const contact = await contactService.createContact(validRows[i]);
        insertedContacts.push(contact);
      } catch (error) {
        duplicateErrors.push({
          row: i + 2,
          data: validRows[i],
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Upload completed',
      totalRows: rows.length,
      inserted: insertedContacts.length,
      duplicates: duplicateErrors.length,
      duplicateErrors: duplicateErrors
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};


const exportContacts = async (req, res) => {
  try {
    const { fields, ids, search, filter } = req.query;

    let contacts;

    if (ids) {
      const idArray = ids.split(',');
      contacts = await Promise.all(
        idArray.map(id => contactService.getContactById(id))
      );
    } else if (search || filter) {
      const result = await contactService.getContacts({
        search,
        filter: filter ? JSON.parse(filter) : {},
        limit: 10000
      });
      contacts = result.contacts;
    } else {
      const result = await contactService.getContacts({ limit: 10000 });
      contacts = result.contacts;
    }

    const selectedFields = fields ? fields.split(',') : [];
    const buffer = excelService.generateExportFile(contacts, selectedFields);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts-export.xlsx');
    res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
};

//export
module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  deleteContactsBatch,
  startEdit,
  endEdit,
  uploadContacts,
  exportContacts
};