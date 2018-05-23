aws_account = "144992683770"

aws_region = "us-east-1"

ssm_logz_io_token_key = "/dev/lambda/logzio-token"

lambda_git_owner = "getndazn"

stage = "dev"

lambda_git_branch = "feature/naming-fix"

tags = {
  Application = "dazndev"
  Description = "log shipping lambda"
}

cloudwatch_logs_prefixes = [ "/aws/lambda" ]

name = "cloudwatch-logs"