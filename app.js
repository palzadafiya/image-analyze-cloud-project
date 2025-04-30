const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', { result: null });
});

app.post('/upload', upload.single('image'), async (req, res) => {
  const { email } = req.body;
  const imagePath = req.file.path;
  const image = fs.readFileSync(imagePath, { encoding: 'base64' });

  try {
    const response = await fetch(process.env.ML_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        filename: req.file.originalname,
        imageData: image
      })
    });

    const data = await response.json();
    fs.unlinkSync(imagePath); // cleanup temp file

    res.render('index', { result: data });
  } catch (error) {
    console.error("Error during fetch:", error);
    res.render('index', { result: "Error processing image." });
  }
});

app.listen(process.env.PORT);
