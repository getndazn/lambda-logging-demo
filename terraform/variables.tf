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
  default     = "master"
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
  description = "Name taht will be used by pipeline and other resrouces"
  default     = "logz-integration-lambda"
}

variable "tags" {
  type = "map"
}

variable "cloudwatch_logs_prefix" {
  description = "This prefix will be used to filter logs in cloudwatch that should be shipped to logz.io"
}
