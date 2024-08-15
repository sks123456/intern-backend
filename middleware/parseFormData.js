const formidable = require("formidable");
const path = require("path");

// Middleware to parse FormData
const parseFormData = (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }
    body = {};
    for (let key in fields) {
      if (fields[key].length > 1) {
        body[key] = fields[key];
      } else {
        body[key] = fields[key][0];
      }
    }
    console.log(body);
    req.body = body;
    next();
  });
};

module.exports = { parseFormData };
