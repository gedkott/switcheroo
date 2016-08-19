var url = require('url');

var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    // pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

module.exports = {
    setContextToPending: function(githubRepo, sha, context) {
        if (!githubRepo || !sha || !context) {
            return Promise.reject(new Error('Missing args'));
        }
        var user = url.parse(githubRepo).path.split('/')[1];
        var repo = url.parse(githubRepo).path.split('/')[2];
        return new Promise(function(resolve, reject) {
            // OAuth2
            try {
                github.authenticate({
                    type: "oauth",
                    token: process.env.AUTH_TOKEN
                });
            } catch (error) {
                return reject(error);
            }
            github.repos.createStatus({
                user: user,
                repo: repo,
                sha: sha,
                state: 'pending',
                target_url: 'https://' + 'FILL THIS IN',
                description: 'FILL THIS IN',
                context: context
            }, function(err, res) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(res);
                }
            });
        });
    }
}
