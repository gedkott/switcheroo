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
        console.log("init")
        var p = new Promise(function(resolve, reject) {
            fs.readdir(config.DEFAULT_REAL_DIR, function(err, files) {
                console.log(err, files)
                if (err) {
                    console.log("ERR")
                    console.log(err)
                    return reject(err);
                }
                var promises = files.map(function(file) {
                    return new Promise(function(resolve, reject) {
                        console.log("Getting file from place and moving")
                        var readable = fs.createReadStream(path.resolve(config.DEFAULT_REAL_DIR, file));
                        console.log(readable)
                        readable.on('data', (chunk) => {
                            console.log(`readable Received ${chunk.length} bytes of data.`);
                        });
                        readable.on('end', () => {
                            console.log('readable There will be no more data.');
                            return resolve({
                              'poop': 1
                            });
                        });
                        readable.on('error', function(error) {
                            console.error('readable', error);
                        });
                        console.log('readable created')
                        console.log(`Writing to ${path.resolve(config.DEFAULT_ACTIVE_DIR, path.basename(file))}`)
                        var writable = fs.createWriteStream(path.resolve(config.DEFAULT_ACTIVE_DIR, path.basename(file)));
                        console.log("var writable creates")
                        writable.on('data', (chunk) => {
                            console.log(`writable, Received ${chunk.length} bytes of data.`);
                        });
                        writable.on('end', () => {
                            console.log('writable, There will be no more data.');
                            return resolve('adsasds');
                        });
                        writable.on('error', function(error) {
                            console.error('writable', error);
                        });
                        console.log('writable created')

                        readable
                            .pipe(writable)
                            .on('error', (error) => {
                                console.log('pipe', error)
                                return reject('asdd');
                            })
                            .on('end', () => {
                                console.log('end')
                                return reject('asdasd');
                            });
                        console.log('pipng')
                    });
                });
                console.log(promises);
                return Promise.all(promises)
                  .then((a) => {
                    console.log(a, "Moving");
                    return resolve([ { special: 'response' } ]);
                  })
                  .catch((err) => {
                    console.log(err)
                  });
            });
        });
        return p
            .then((err) => {
                console.log(err, "DUmb")
                return err;
            })
            .catch((err) => {
              console.log(err, "ERR in ")
            });
    }
};
