const test = require('tape');
const path = require('path');

const switcheroo = require('../index.js');
console.log(switcheroo)
const fs = require('fs');

const DEFAULT_MOCK_DIR = path.resolve('..', __dirname, 'mock-apis');
const DEFAULT_REAL_DIR = path.resolve('..', __dirname, 'real-apis');
const DEFAULT_ACTIVE_DIR = path.resolve(path.dirname(__dirname), 'active-apis');
console.log(__dirname, DEFAULT_ACTIVE_DIR)

test('how you use it!', function(t) {
    var promise = switcheroo.init();
    console.log(promise)
    promise
        .then(function(res) {
            console.log("RES:", res);
            t.ok(JSON.stringify(res) === JSON.stringify([ { special: 'response' } ]), "the response should propagate")
            fs.readdir(DEFAULT_ACTIVE_DIR, function(err, files) {
              if (err) {
                console.log("ERR asd", err)
                throw err;
              }
              console.log("Read files successufll");
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
              t.ok(arrayEquals(files, [
                'api-1.js',
              ]), 'should see the files moved from real to active by default');
              var wait = files.length;
              files.forEach(function(file) {
                fs.readFile(path.resolve('..', DEFAULT_ACTIVE_DIR, file), function(err, data) {
                  if (err) {
                    console.log("ERR", err)
                    throw err;
                  }
                  console.log('Got data')
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
          console.log("ERR")

            t.fail(error);
            t.end();
        });
});
