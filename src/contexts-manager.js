var fs = require('fs');
var path = require('path');

var Git = require("nodegit");

var getHeadCommit = function(repository) {
    return repository.getHeadCommit();
};

var getCommitSha = function(commit) {
    return commit.sha();
};

var getSha = Git.Repository.open(path.resolve(process.cwd()))
    .then(getHeadCommit)
    .then(getCommitSha);

var readContexts = new Promise(function(resolve, reject) {
    // TODO(gedkott): I just assume that for now the system must be run from the root of the project
    fs.readFile(path.resolve(process.cwd(), 'contexts.json'), function(error, data) {
        if (error) {
            return reject(error);
        }
        return resolve(JSON.parse(data.toString()));
    });
});

module.exports = {
    load: function() {
        return Promise.all([
                readContexts,
                getSha
            ])
            .then(function(values) {
                var contextObject = values[0];
                var sha = values[1];
                contextObject.sha = sha;
                return contextObject;
            });
    }
}
