'use strict';

const regions = [ "us-east-1" ];
const accountId = "144992683770";
const shipLogsFuncName = "cloudwatch-logs-dev-ship-logs-to-logzio";
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
];

require('./process_all').processAll(shipLogsFuncName, accountId, regions, prefixes);
