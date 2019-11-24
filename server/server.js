const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const bodyParser = require("body-parser");

const path = require('path');
const multer = require('multer');
const cors = require('cors');

const returnZipCodes = require('./zip_codes');
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
      destination: function (req, file, cb) {
      cb(null, 'build')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
});

const upload = multer({ storage: storage }).single('file');

app.use(express.static(path.join(__dirname, '../build')));

app.post('/upload', function(req, res) {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }
    let results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', function(data) {
        try {
          results.push(data);
        } catch(err) {
          return res.status(500).json(err);
        }
      }).on('end', function() {
        console.log('reached end of file');
        fs.unlink(req.file.path, function(err) {
          console.log('successfully deleted local image');
          return res.status(200).json({
            new_data: results,
            zipCodes: returnZipCodes(results)
          });
        })
    });
  });
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(process.env.PORT || 8080, () => {
  console.log('App running on port 8080');
});
