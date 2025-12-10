const express = require('express');
const router = express.Router();
const multer = require('multer');
const contactController = require('../controllers/contactController');
const { uploadContacts, exportContacts } = require('../controllers/contactController');


const storage = multer.memoryStorage(); // Store in memory as buffer

const fileFilter = (req, file, cb) => {
  // Check file extension
  const allowedExtensions = ['.xlsx', '.xls'];
  const ext = file.originalname.toLowerCase().slice(-5);
  
  if (ext.includes('.xlsx') || ext.includes('.xls')) {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx and .xls files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

//upload rout..
router.post('/upload', upload.single('file'), uploadContacts);
router.get('/export', exportContacts);

//crud 
router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContactById);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

//batch op.
router.post('/batch-delete', contactController.deleteContactsBatch);

//edit
router.post('/:id/start-edit', contactController.startEdit);
router.post('/:id/end-edit', contactController.endEdit);

module.exports = router;