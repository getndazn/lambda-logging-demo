'use strict';

const { expect } = require('code');
const lab = require('lab').script();

const { describe, it } = lab;
module.exports.lab = lab;

const { logMessage } = require('../functions/ship-logs/parse');

describe('Logs parsing should', () => {

    it('correctly parse lambda log', (done) => {
        const event = {
            message: `2018-05-25T08:18:00.304Z	233561b4-5ff4-11e8-b529-d3e3b353d379	{
            "name": "rs-web",
            "module": {
                "type": "lambda",
                "version": "1.8.15",
                "functionName": "be_prod_rs-web_eu-central-1"
            },
            "level": 30,
            "message": "Successful download from S3 bucket",
            "request": {
                "Key": "rs-labels-de.json"
            },
            "time": "2018-05-25T08:18:00.303Z",
            "v": 0,
            "sLevel": "INFO"
        }`
    };

        const logGroup = '/aws/lambda/service-env-funcName';
        const parsed = logMessage(logGroup, event);
        expect(parsed).to.exist();

        expect(parsed.level).to.equal('debug');
        expect(parsed.fields.requestId).to.equal('233561b4-5ff4-11e8-b529-d3e3b353d379');
        expect(parsed.fields.timestamp).to.equal('2018-05-25T08:18:00.304Z');
        expect(parsed.fields.event.message).to.equal('Successful download from S3 bucket');

    });

    it('correctly pass json message', (done) => {

        const event = {
            message: `{
                "name": "pushnotifi-reminders",
                "hostname": "e133037b1dc6",
                "pid": 1,
                "module": {
                    "type": "container",
                    "version": "1.0.0"
                },
                "level": 30,
                "msg": "Started adding reminders of user c7a5389d-d250-4168-80d9-a0bed9a68de1 for device 5b12af4029dfdd1f",
                "time": "2018-05-25T09:22:43.502Z",
                "v": 0,
                "sLevel": "INFO"
                }`
        };

        const logGroup = 'push_notifi/get_device';
        const parsed = logMessage(logGroup, event);
        expect(parsed).to.exist();

        expect(parsed.level).to.equal('debug');
        expect(parsed.fields.requestId).to.equal('n/a');
        expect(parsed.fields.timestamp).to.equal('2018-05-25T09:22:43.502Z');
        expect(parsed.fields.event.msg).to.equal('Started adding reminders of user c7a5389d-d250-4168-80d9-a0bed9a68de1 for device 5b12af4029dfdd1f');
    });

});
