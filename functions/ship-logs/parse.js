'use strict';


let isLambda = function(logGroup) {
  return logGroup.includes('/aws/lambda/');
}

// logGroup looks like this:
//    "logGroup": "/aws/lambda/service-env-funcName"
let name = function (logGroup) {
  if (isLambda(logGroup) ) {
    return logGroup.split('/').reverse()[0];
  }

  return logGroup;
};

// logStream looks like this:
//    "logStream": "2016/08/17/[76]afe5c000d5344c33b5d88be7a4c55816"
let version = function (logGroup, logStream) {
  if (isLambda(logGroup) ) {
    let start = logStream.indexOf('[');
    let end = logStream.indexOf(']');
    return logStream.substring(start+1, end);
  }

  return "n/a";
};

let tryParseJson = function (str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

// a Lambda function log message looks like this:
//    "2017-04-26T10:41:09.023Z	db95c6da-2a6c-11e7-9550-c91b65931beb\tloading index.html...\n"
// but there are START, END and REPORT messages too:
//    "START RequestId: 67c005bb-641f-11e6-b35d-6b6c651a2f01 Version: 31\n"
//    "END RequestId: 5e665f81-641f-11e6-ab0f-b1affae60d28\n"
//    "REPORT RequestId: 5e665f81-641f-11e6-ab0f-b1affae60d28\tDuration: 1095.52 ms\tBilled Duration: 1100 ms \tMemory Size: 128 MB\tMax Memory Used: 32 MB\t\n"
let parseLogMessage = function (logGroup, logEvent) {
  if (logEvent.message.startsWith('START RequestId') ||
      logEvent.message.startsWith('END RequestId') ||
      logEvent.message.startsWith('REPORT RequestId') ||
      isMonitoringMsg(logEvent.message)) {

    return null;
  }

  const fields = extractFromEvent(logGroup, logEvent);
  if (!fields) {
    return {
      level        : 'debug',
      message      : logEvent,
      '@timestamp' : new Date()
    };
  }

  const { timestamp, requestId, event } = fields;
  let level = fields.level || fields.sLevel || 'debug';
  if (fields.level || fields.sLevel ) {
    level = JSON.stringify(fields.level || fields.sLevel);
  }

  let message = fields.message;

  // level and message are lifted out, so no need to keep them there
  delete fields.level;
  delete fields.message;

  return { level, message, fields, '@timestamp': new Date(timestamp) };

};

function extractFromEvent(logGroup, logEvent) {

  if (isLambda(logGroup)) {
    const parts     = logEvent.message.split('\t', 3);
    const timestamp = parts[0];
    const requestId = parts[1];
    const event     = parts[2];

    return {
      timestamp,
      requestId,
      event: tryParseJson(event)
    }
  }

  const event = tryParseJson(logEvent.message);
  if (!event) {
    return null;
  }

  return {
      timestamp: event.time,
      requestId: "n/a",
      event
  }
}

function isMonitoringMsg(msg) {
  if (!msg) {
      return false;
  }

  const split = msg.split(/\s/);

  if ( split.length < 3 ) {
      return false;
  }

  if ( !split[2].startsWith('MONITORING|') ) {
      return false;
  }

  return true;
}

module.exports = {
  name,
  version,
  isLambda,
  logMessage: parseLogMessage
};