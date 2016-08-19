var test = require('tape');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var contextsManager = require('../contexts-manager');

test('context manager', function(t) {
    t.test('Fully system level integrated run through', function(t) {
        var promise = contextsManager.load();
        t.ok(promise instanceof Promise, 'contexts-manager should return a promise');
        promise.then(function(contextObject) {
            t.ok(contextObject, 'Should receive the contextObject');
            t.ok(contextObject.contexts, 'Should receive the contexts mapping');
            t.ok(contextObject.githubRepo, 'Should receive the github repo URL');
            t.ok(contextObject.sha, 'Should receive the sha');
            t.end();
        });
    });

    t.test('What happens if filesystem fails', function(t) {
        var fsMock = {
            readFile: function(filename, callback) {
                return callback(new Error('STUPID FS ERROR OCCURED'), null);
            }
        };

        var contextsManager = proxyquire('../contexts-manager', {
            'fs': fsMock
        });

        contextsManager.load().then(function(contextObject) {
                t.fail('We are expecting an error to occur');
                t.end();
            })
            .catch(function(error) {
                t.deepEqual(error, new Error('STUPID FS ERROR OCCURED'), 'Should reeive error object in catch block');
                t.end();
            });
    });
});
