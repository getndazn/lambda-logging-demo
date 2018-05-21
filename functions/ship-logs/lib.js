'use strict';

const co      = require('co');
const Promise = require('bluebird');
const parse   = require('./parse');
const net     = require('net');
const host    = process.env.logstash_host;
const port    = process.env.logstash_port;

const ssm = new require('AWS').SSM();
const ssmParams = {
  Name: process.env.SSM_LOGZ_IO_TOKEN_KEY,
  WithDecryption: true
};

let processAll = co.wrap(function* (logGroup, logStream, logEvents) {
  let lambdaVersion = parse.lambdaVersion(logStream);
  let functionName  = parse.functionName(logGroup);

  console.log("Before parameter yield ", token);

  const token = yield ssm.getParameter(ssmParams).promise().catch( err => {
    console.log("Got error while catching token ", err);
    return "";
  });

  console.log("token is ", token);

  yield new Promise((resolve, reject) => {
    let socket = net.connect(port, host, function() {
      socket.setEncoding('utf8');

      for (let logEvent of logEvents) {
        try {
          let log = parse.logMessage(logEvent);
          if (log) {
            log.logStream     = logStream;
            log.logGroup      = logGroup;
            log.functionName  = functionName;
            log.lambdaVersion = lambdaVersion;
            log.fields        = log.fields || {};
            log.type          = "cloudwatch";
            log.token         = token;

            socket.write(JSON.stringify(log) + '\n');
          }

        } catch (err) {
          console.error(err.message);
        }
      }

      socket.end();

      resolve();
    });
  });
});

module.exports = processAll;