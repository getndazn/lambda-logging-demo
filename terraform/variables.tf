variable "aws_region" {}

variable "aws_account" {
  description = "This must be the same as to ./aws/config profile name which you want to use for deployment"
}

variable "stage" {
  description = "environment stage e.g dev/stage/prod"
}

variable "logstash_host" {
  description = "Address of logstash host"
  default     = "listener.logz.io"
}

variable "logstash_port" {
  description = "Port for logstash"
  default     = "5050"
}

variable "ssm_logz_io_token_key" {
  description = "ssm path to logz.io ciphered token"
}

variable "lambda_git_branch" {
  description = "Branch from which lambda sohuld be deployed"
  # default     = "master"
  default = "feature/naming-fix"
}

variable "lambda_git_owner" {
  description = "Owner of lambda repository"
  default     = "getndazn"
}

variable "lambda_git_repo" {
  description = "Repositroy name for github"
  default     = "lambda-logging-demo"
}

variable "name" {
  description = "Name that will be used by pipeline and other resrouces"
  default     = "logz-integration-lambda"
}

variable "tags" {
  type = "map"
}

variable "retention_days" {
  default = "90"
  description = "how long should logs be stored in cloudwatch"
}

variable "cloudwatch_logs_prefixes" {
  type = "list"
  description = "List of prefiex that will be used to filter logs in cloudwatch that should be shipped to logz.io"
  default = [
    "/aws/lambda/be_dev_jappred-web",
    "/aws/lambda/be_dev_rs-translations-web-api",
    "/aws/lambda/be_dev_rs-web",
    "/aws/lambda/be_dev_rs-articles",
    "/aws/lambda/be_dev_rs-labels",
    "/aws/lambda/be_dev_s3-buckets-replication",
    "/aws/lambda/be_dev_push-notification-device-registration",
    "/aws/lambda/be_dev_push-notification-sender",
    "/aws/lambda/be_dev_notifi",

    "/aws/lambda/be_stage_jappred-web",
    "/aws/lambda/be_stage_rs-translations-web-api",
    "/aws/lambda/be_stage_rs-web",
    "/aws/lambda/be_stage_rs-articles",
    "/aws/lambda/be_stage_rs-labels",
    "/aws/lambda/be_stage_s3-buckets-replication",
    "/aws/lambda/be_stage_push-notification-device-registration",
    "/aws/lambda/be_stage_push-notification-sender",
    "/aws/lambda/be_stage_notifi",

    "pushnotifi_dev",
    "pushnotifi_stage"
  ]
}
