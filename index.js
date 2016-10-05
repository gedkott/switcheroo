var fs = require('fs');
var path = require('path');

var config = require('./config.js');

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (directoryExists(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function directoryExists(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (err) {
        return false;
    }
}

module.exports = {
    init: function() {
        ensureDirectoryExistence(path.resolve(config.DEFAULT_ACTIVE_DIR, 'fake.js'));
        var p = new Promise(function(resolve, reject) {
            fs.readdir(config.DEFAULT_REAL_DIR, function(err, files) {
                if (err) {
                    return reject(err);
                }
                var promises = files.map(function(file) {
                    return new Promise(function(resolve, reject) {
                        var readable = fs.createReadStream(path.resolve(config.DEFAULT_REAL_DIR, file));
                        readable.on('end', () => {
                            return resolve();
                        });
                        readable.on('error', function(error) {
                        });
                        console.log(`Writing to ${path.resolve(config.DEFAULT_ACTIVE_DIR, path.basename(file))}`)
                        var writable = fs.createWriteStream(path.resolve(config.DEFAULT_ACTIVE_DIR, path.basename(file)));

                        writable.on('end', () => {
                            return resolve();
                        });

                        readable
                            .pipe(writable)
                            .on('error', (error) => {
                                return reject();
                            })
                            .on('end', () => {
                                return reject();
                            });
                    });
                });
                return Promise.all(promises)
                  .then((a) => {
                    return resolve();
                  })
                  .catch((err) => {
                    return reject();
                  });
            });
        });
        return p
            .then((err) => {
                return err;
            })
            .catch((err) => {
            });
    }
};
