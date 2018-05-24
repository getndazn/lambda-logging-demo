'use strict';

const co      = require('co');
const Promise = require('bluebird');

const retentionDays = 90;


const processRegion = co.wrap(function* (funcName, accountId, region, prefix) {
  console.log(`started processing region ${region} and prefix ${prefix}`);
  const destFuncArn = `arn:aws:lambda:${region}:${accountId}:function:${funcName}`;

  const AWS = require('aws-sdk');
  AWS.config.region = region;
  const cloudWatchLogs = new AWS.CloudWatchLogs();
  const lambda         = new AWS.Lambda();

  let listLogGroups = co.wrap(function* (acc, nextToken) {

    let req = {
      limit: 50,
      logGroupNamePrefix: prefix,
      nextToken: nextToken
    };
    let resp = yield cloudWatchLogs.describeLogGroups(req).promise();

    let newAcc = acc.concat(resp.logGroups.map(x => x.logGroupName));
    if (resp.nextToken) {
      return yield listLogGroups(newAcc, resp.nextToken);
    } else {
      return newAcc;
    }
  });

  let subscribe = co.wrap(function* (logGroupName) {
    let options = {
      destinationArn : destFuncArn,
      logGroupName   : logGroupName,
      filterName     : 'ship-logs',
      filterPattern  : '[timestamp=*Z, request_id="*-*", event]'
    };

    try {
      yield cloudWatchLogs.putSubscriptionFilter(options).promise();
    } catch (err) {
      console.log(`FAILED TO SUBSCRIBE [${logGroupName}]`);
      console.error(JSON.stringify(err));

      if (err.retryable === true) {
        let retryDelay = err.retryDelay || 1000;
        console.log(`retrying in ${retryDelay}ms`);
        yield Promise.delay(retryDelay);
        yield subscribe(logGroupName);
      }
    }
  });

  let setRetentionPolicy = co.wrap(function* (logGroupName) {
    let params = {
      logGroupName    : logGroupName,
      retentionInDays : retentionDays
    };

    yield cloudWatchLogs.putRetentionPolicy(params).promise();
  });

  let process = co.wrap(function* () {
    let logGroups = yield listLogGroups([]);
    console.log(`log groups are ${logGroups}`);
    for (let logGroupName of logGroups) {
      console.log(`[${region}] subscribing [${logGroupName}]...`);
      yield subscribe(logGroupName);

      console.log(`updating retention policy for [${logGroupName}]...`);
      yield setRetentionPolicy(logGroupName);
    }
  });

  process().then(_ => console.log(`done for ${region} and prefix ${prefix}`));
});

module.exports.processAll = co.wrap(function* (shipLogsFuncName, accountId, regions, prefixes) {
  regions.forEach(co.wrap(function* (region) {
    prefixes.forEach(co.wrap(function* (prefix) {

      yield processRegion(shipLogsFuncName, accountId, region, prefix);
    }));
  }));
});