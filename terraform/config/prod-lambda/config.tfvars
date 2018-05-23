aws_account = "728650748678"

aws_region = "us-east-1"

ssm_logz_io_token_key = "/prod/lambda/logzio-token"

lambda_git_owner = "getndazn"

stage = "prod"

lambda_git_branch = "master"

tags = {
  Application = "dazndev"
  Description = "log shipping lambda"
}

cloudwatch_logs_prefix = [ "/aws/lambda" ]
