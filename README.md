# lambda-logging-demo

A group of Lambda functions for:
* shipping logs to Logz.io (hosted ELK stack)
* auto-subscribe new log groups to the aforementioned function so you don't have to subscribe them manually
* auto-updates the retention policy of new log groups to 7 days (configurable)

as for autosubscribe action it does not work for existing log groups so you should run scripts from `process_all` directory if adding logs to existing resources.

## Deployment with code pipeline

For now this is not deployed on dev and stage because of qouta limits on logz.io

This deployments are working for new log groups, if you have already existing lambdas with log groups, then you should look at `process_all` directory and modify input parameters, it will create subscriptions for already existing lambdas.

Deployment for lambda logs shipping, if you are adding another resource for which logs should be shipped then just add new directory under `terraform/deployment/config` and add new `remote` and `tfvars` files.

Deployment needs encrypted logz.io token stored in parameter store, name of key from parameter store is passed into `/dev/lambda/logzio-token` variable.

Familiarize yourself with `cloudwatch_logs_prefixes` terraform variable because this is list of log groups prefixes that will be sending logs to logz.io.

below example is for `dev-lambda`:

```bash
cd terraform
export GITHUB_TOKEN=token_with_access_to_repo # required for the first launch time, later can be omitted
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


### launching pipelines for production

```bash
aws codepipeline start-pipeline-execution --name prod-cloudwatch-logs --region us-west-2
aws codepipeline start-pipeline-execution --name prod-cloudwatch-logs --region eu-central-1
aws codepipeline start-pipeline-execution --name prod-cloudwatch-logs --region ap-northeast-1
aws codepipeline start-pipeline-execution --name prod-cloudwatch-logs --region us-east-1

```


## Updating existing log groups

1. open the `process_all` directory.
2. investigate one of `process_all_${env}.js` files, based on env which you want to update.
3. run selected file.