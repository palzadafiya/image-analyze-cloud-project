const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Configure storage to keep original filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')  // Store in public/uploads
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp
    cb(null, Date.now() + '-' + file.originalname)
  }
});


const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files from public
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', { result: null, imageUrl: null });
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Construct correct URL path (relative to public folder)
    const imageUrl = '/uploads/' + req.file.filename;

    // Process image (your existing code)
    const image = fs.readFileSync(req.file.path, { encoding: 'base64' });
    const response = await fetch(process.env.ML_URL, {
      method: 'POST',
      body: JSON.stringify({
        email: req.body.email,
        filename: req.file.filename,
        imageData: image
      })
    });
    const data = await response.json();

    // Render with proper image URL
    res.render('index', {
      result: data.labels.join(', '),
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error(error);
    res.render('index', {
      result: "Error: " + error.message,
      imageUrl: null
    });
  }
});

app.listen(process.env.PORT);