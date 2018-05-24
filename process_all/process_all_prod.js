'use strict';

const regions = [ "us-east-1"];

const accountId = "728650748678";
const shipLogsFuncName = "cloudwatch-logs-prod-ship-logs-to-logzio";
const prefixes = [
  "/aws/lambda/be_prod_jappred-web",
  "/aws/lambda/be_prod_rs-translations-web-api",
  "/aws/lambda/be_prod_rs-web",
  "/aws/lambda/be_prod_rs-articles",
  "/aws/lambda/be_prod_rs-labels",
  "/aws/lambda/be_prod_s3-buckets-replication",
  "/aws/lambda/be_prod_push-notification-device-registration",
  "/aws/lambda/be_prod_push-notification-sender",

  "pushnotifi_prod"
];

require('./process_all').processAll(shipLogsFuncName, accountId, regions, prefixes);
