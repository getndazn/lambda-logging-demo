'use strict';

const co      = require('co');
const Promise = require('bluebird');
const AWS     = require('aws-sdk');

// CONFIGURE THESE!!!
// ============================================
// const regions = [ "us-east-1", "eu-central-1", "us-east-1", "us-west-2" ];
const regions = [ "us-east-1" ];

const accountId = "144992683770";
const funcName = "cloudwatch-logs-dev-ship-logs-to-logzio";
const retentionDays = 90;       // change this if you want
const prefixes = [
  "/aws/lambda/be_dev_jappred-web",
  "/aws/lambda/be_dev_rs-translations-web-api",
  "/aws/lambda/be_dev_rs-web",
  "/aws/lambda/be_dev_rs-articles",
  "/aws/lambda/be_dev_rs-labels",
  "/aws/lambda/be_dev_s3-buckets-replication",
  "/aws/lambda/be_dev_push-notification-device-registration",
  "/aws/lambda/be_dev_push-notification-sender",

  "/aws/lambda/be_stage_jappred-web",
  "/aws/lambda/be_stage_rs-translations-web-api",
  "/aws/lambda/be_stage_rs-web",
  "/aws/lambda/be_stage_rs-articles",
  "/aws/lambda/be_stage_rs-labels",
  "/aws/lambda/be_stage_s3-buckets-replication",
  "/aws/lambda/be_stage_push-notification-device-registration",
  "/aws/lambda/be_stage_push-notification-sender",

  "pushnotifi_dev",
  "pushnotifi_stage",
]
// ============================================

regions.forEach( region => {

  prefixes.forEach( prefix => {

    processRegion(region, prefix);
  });
});


function processRegion(region, prefix) {
  AWS.config.region = region;
  const destFuncArn = `arn:aws:lambda:${region}:${accountId}:function:${funcName}`;
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
    for (let logGroupName of logGroups) {
      console.log(`[${region}] subscribing [${logGroupName}]...`);
      yield subscribe(logGroupName);

      console.log(`updating retention policy for [${logGroupName}]...`);
      yield setRetentionPolicy(logGroupName);
    }
  });

  process().then(_ => console.log(`done for ${region} and prefix ${prefix}`));
}