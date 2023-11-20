module.exports = {
  globals: {
    document: "readonly",
    console: "readonly",
    window: "readonly",
    // Add more global variables as needed
  },
  parserOptions: {
    ecmaVersion: 8, // Set to 6 or higher for ES6+ support
    sourceType: "module", // Allows for the use of imports
  },
  rules: {
    "require-await": "error",
  },
  // Other ESLint configurations can go here
};
