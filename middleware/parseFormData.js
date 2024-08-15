const formidable = require("formidable");
const path = require("path");

// Middleware to parse FormData
const parseFormData = (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }
    req.body = fields;
    next();
  });
};
