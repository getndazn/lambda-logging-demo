# lambda-logging-demo

A group of Lambda functions for:
* shipping logs to Logz.io (hosted ELK stack)
* auto-subscribe new log groups to the aforementioned function so you don't have to subscribe them manually
* auto-updates the retention policy of new log groups to 7 days (configurable)


## Deployment with code pipeline

Deployment for lambda logs shipping, if you are adding another resource for which logs should be shipped then just add new directory under `terraform/deployment/config` and add new `remote` and `tfvars` files

below example is for `dev-labmda`

```bash
cd terraform
rm -rf ./.terraform # needed when you are switching between backends
terraform init -backend -backend-config=config/dev-lambda/config.remote
terraform apply -var-file=config/dev-lambda/config.tfvars
```

if you are running terraform for the first time you will see error
```
[ERROR] Error updating CodePipeline (dev-logz-integration-lambda): InvalidActionDeclarationException: Action configuration for action 'Source' is missing required configuration 'OAuthToken'
```

then before `terraform apply` you need to export github token variable:
```
export GITHUB_TOKEN=token_with_access_to_repo
```

You can generate such token in github settings page of your account.


## Deployment

1. insert the `logstash_host`, `logstash_port` and `token` in the `serverless.yml` file (under the `ship-logs-to-logzio` function's environment variables).

`token`: your Logz.io account token. Can be retrieved on the Settings page in the Logz.io UI.
`logstash_host`: if you are in the EU region insert `listener-eu.logz.io`, otherwise, use `listener.logz.io`. You can tell which region you are in by checking your login URL - app.logz.io means you are in the US. app-eu.logz.io means you are in the EU.
`logstash_port`: this should be 5050, but is subject to change. See [this](https://app.logz.io/#/dashboard/data-sources/logstash) page for details.

for example:

```
ship-logs-to-logzio:
  handler: functions/ship-logs/handler.handler
  description: Sends CloudWatch logs to Logz.io
  environment:
    logstash_host: listener.logz.io
    logstash_port: 5050
    token: CduNgGwuFFeUVzbXvqVDXoGkjxEdKzc9
```

2. run `./build.sh deploy dev` to deploy to a stage called "dev"

## Updating existing log groups

1. open the `process_all.js` script, and fill in the missing configuration values

2. run `node process_all.js`