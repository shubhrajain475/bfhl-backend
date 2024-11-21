const express = require("express");
const bodyParser = require("body-parser");
const base64topdf = require("base64topdf");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Helper Functions
const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const validateFile = (fileBase64) => {
  if (!fileBase64) return { valid: false };
  try {
    const filePath = "tempfile"; // Temporary file path
    base64topdf.base64Decode(fileBase64, filePath);
    const stats = fs.statSync(filePath);
    const sizeKb = stats.size / 1024;
    const mimeType = "application/pdf"; // Assuming PDF; extendable logic
    fs.unlinkSync(filePath); // Clean up temporary file
    return { valid: true, mimeType, sizeKb: sizeKb.toFixed(2) };
  } catch (err) {
    return { valid: false };
  }
};

// Routes
// GET Route
app.get("/bfhl", (req, res) => {
  res.status(200).json({
    operation_code: 1,
  });
});

// POST Route
app.post("/bfhl", (req, res) => {
  const { data, file_b64 } = req.body;

  // Static User Data
  const user_id = "john_doe_17091999"; // Change dynamically if required
  const email = "john@xyz.com";
  const roll_number = "ABCD123";

  // Validate Input
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ is_success: false, message: "Invalid data format" });
  }

  // Process Data
  const numbers = data.filter((item) => !isNaN(item));
  const alphabets = data.filter((item) => /^[a-zA-Z]$/.test(item));
  const lowerCaseAlphabets = alphabets.filter((ch) => /^[a-z]$/.test(ch));
  const highestLowerCase = lowerCaseAlphabets.length
    ? [lowerCaseAlphabets.sort().pop()]
    : [];
  const isPrimeFound = numbers.some((num) => isPrime(Number(num)));

  // File Handling
  const fileInfo = validateFile(file_b64);

  // Construct Response
  const response = {
    is_success: true,
    user_id,
    email,
    roll_number,
    numbers,
    alphabets,
    highest_lowercase_alphabet: highestLowerCase,
    is_prime_found: isPrimeFound,
    file_valid: fileInfo.valid,
    file_mime_type: fileInfo.mimeType || null,
    file_size_kb: fileInfo.sizeKb || null,
  };

  res.status(200).json(response);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
