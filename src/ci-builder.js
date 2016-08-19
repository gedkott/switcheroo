var contextsManager = require('./contexts-manager');
var githubApi = require('./github-api');

module.exports = {
    init: function() {
        return new Promise(function(resolve, reject) {
            contextsManager.load()
                .then(function(data) {
                    var awaiting = [];
                    for (var context in data.contexts) {
                        awaiting.push(githubApi.setContextToPending(data.githubRepo, data.sha, context));
                    }
                    return Promise.all(awaiting);
                })
                .then(resolve)
                .catch(reject);
        })
    }
};
