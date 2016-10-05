const test = require('tape');
const path = require('path');

const switcheroo = require('../index.js');
const fs = require('fs');

const DEFAULT_MOCK_DIR = path.resolve('..', __dirname, 'mock-apis');
const DEFAULT_REAL_DIR = path.resolve('..', __dirname, 'real-apis');
const DEFAULT_ACTIVE_DIR = path.resolve(path.dirname(__dirname), 'active-apis');

test('how you use it!', function(t) {
    var promise = switcheroo.init();
    promise
        .then(function(res) {
            fs.readdir(DEFAULT_ACTIVE_DIR, function(err, files) {
              if (err) {
                throw err;
              }
              function arrayEquals(a, b) {
                for (var i = 0; i < a.length; i++) {
                  if (a[i] === b[i]) {
                    continue;
                  } else {
                    return true;
                  }
                }
                return true;
              };
              var actualFiles = files.filter(function(file) {
                return file !== '.gitignore';
              });
              t.ok(arrayEquals(actualFiles, [
                'api-1.js',
              ]), 'should see the files moved from real to active by default');
              var wait = actualFiles.length;
              actualFiles.forEach(function(file) {
                fs.readFile(path.resolve('..', DEFAULT_ACTIVE_DIR, file), function(err, data) {
                  if (err) {
                    throw err;
                  }
                  t.equal(data.toString(), "module.exports = function FakeAPI() {\n  // Hit up Google...\n  return \'I am real as can be\';\n};\n", file + " The content of the file should be the real api content");
                  wait--;
                  if (wait === 0) {
                    t.end();
                  } else {
                    //
                  }
                });
              });
            });
        }).catch(function(error) {
            t.fail(error);
            t.end();
        });
});
