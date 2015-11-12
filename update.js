#!/usr/bin/env node

var exec            = require('child_process').exec;
var validateMessage = require('./validate').validateMessage;

var branch     = process.argv[1];
var before     = process.argv[3];
var hash       = process.argv[4];

function formatHashRange(from, to) {
  return from + '..' + to;
}

function getCommits(from, to, cb) {
  exec('git log --pretty=format:%H ' + formatHashRange(from, to), getCommitsFromLog);

  function getCommitsFromLog(error, stdout, stderr) {
    if (error) { return cb(error, []); }
    var commits = stdout.split('\n');
    cb(null, commits);
  }
}

function getLogFor(hash, cb) {
  exec('git log -1 --pretty=format:%B ' + hash, getMessage);

  function getMessage(error, stdout, stderr) {
    if (error) { cb(error); }
    cb(null, stdout);
  }
}

var commitMessagesValid = true;

getCommits(before, hash, function(err, commits) {
  var lastCommitIndex = commits.length - 1;
  commits.forEach(function(commit, key) {
    getLogFor(commit, function(err, log) {
      commitMessagesValid = validateMessage(log) && commitMessagesValid;

      if (key === lastCommitIndex) {
        done();
      }
    });
  });
});


function done() {
  if (!commitMessagesValid) {
    console.log('');
    console.log('============================================================');
    console.log('Your commits have invalid commit messages');
    console.log('============================================================');
    console.log('');
  }
  process.exit(0);
}



