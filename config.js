const path = require('path');   

const DEFAULT_MOCK_DIR = path.resolve(__dirname, 'mock-apis');
const DEFAULT_REAL_DIR = path.resolve(__dirname, 'real-apis');
const DEFAULT_ACTIVE_DIR = path.resolve(__dirname, 'active-apis');

module.exports = {
  DEFAULT_REAL_DIR: DEFAULT_REAL_DIR,
  DEFAULT_ACTIVE_DIR: DEFAULT_ACTIVE_DIR,
  DEFAULT_MOCK_DIR: DEFAULT_MOCK_DIR
};
