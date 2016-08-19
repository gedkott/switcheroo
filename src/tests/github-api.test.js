var test = require('tape');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var _mock = {
    authenticate: sinon.spy(), // How else can we do this?
    repos: {
        createStatus: sinon.spy()
    }
};

var ioLayerMock = function fakeCostructor() {
    return _mock;
};

var githubAPI = proxyquire('../github-api', {
    'github': ioLayerMock
});

test('GitHub API Interactions', function(t) {
  t.test('should reject if bad args are passed', function(t) {
      var promiseMissingContextArg = githubAPI.setContextToPending("https://github.com/gedkott/ci-builder", 'RANDOM_SHA');
      promiseMissingContextArg
          .then(function(res) {
              t.fail('Should have been rejected since it was missing the context arg');
              t.end();
          })
          .catch(function(error) {
              t.ok(error, "Should have received an error indicating missing args");
              t.equal(error.message, "Missing args", "Message property should say Missing args");
              t.end();
          });
  });

  t.test('setting context to pending under normal circumstances', function(t) {
      var promise = githubAPI.setContextToPending("https://github.com/gedkott/ci-builder", 'RANDOM_SHA', "context/context");
      t.ok(promise instanceof Promise, 'githubapi wrapper should return a promise');
      t.ok(_mock.authenticate.calledOnce, "Authentication should occur");
      var expectedArgs = {
          user: 'gedkott',
          repo: 'ci-builder',
          sha: 'RANDOM_SHA',
          state: 'pending',
          target_url: 'https://FILL THIS IN',
          description: 'FILL THIS IN',
          context: 'context/context'
      };
      t.ok(_mock.repos.createStatus.calledWith(expectedArgs), `The io layer for the githubapi should be called with ${JSON.stringify(expectedArgs)}; called with ${JSON.stringify(_mock.repos.createStatus.lastCall.args[0])}`);
      var callback = _mock.repos.createStatus.lastCall.args[1];
      callback(null, {
          "fake": "response"
      });
      promise.then(function(res) {
          t.deepEqual(res, {
              "fake": "response"
          }, 'Should receive response in then block when resolved');
          t.end();
      })
  });

  t.test('setting context to pending but get rejection from the github api', function(t) {
      var promise = githubAPI.setContextToPending("https://github.com/gedkott/ci-builder", 'RANDOM_SHA', "context/context");
      var callback = _mock.repos.createStatus.lastCall.args[1];
      callback(new Error('SOMETHING FROM GITHUB API BROKE'), null);
      promise
          .then(function(res) {
              t.fail("Should be rejected because of the github API breakage");
              t.end();
          })
          .catch(function(error) {
              t.deepEqual(error, new Error('SOMETHING FROM GITHUB API BROKE'), 'Should receive error from API in then block when rejected');
              t.end();
          });
  });

  t.test('what happens when we get bad authentication error', function(t) {
      var _mock = {
          authenticate: function() {
              throw new Error('Authentication Failure');
          },
          repos: {
              createStatus: sinon.spy()
          }
      };

      var ioLayerMock = function fakeCostructor() {
          return _mock;
      };

      var githubAPI = proxyquire('../github-api', {
          'github': ioLayerMock
      });

      githubAPI.setContextToPending("https://github.com/gedkott/ci-builder", 'RANDOM_SHA', "context/context")
          .then(function(res) {
              t.fail("Should be rejected because of the github authentication breakage");
              t.end();
          })
          .catch(function(error) {
              t.deepEqual(error, new Error('Authentication Failure'), 'Should receive error from auth API in then block when rejected');
              t.end();
          });
  });

});
