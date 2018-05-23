aws_account = "144992683770"

aws_region = "eu-central-1"

ssm_logz_io_token_key = "/dev/lambda/logzio-token"

lambda_git_owner = "getndazn"

stage = "dev"

lambda_git_branch = "feature/AN-1675" # TODO change to master before merge

tags = {
  Application = "dazndev"
  Description = "log shipping lambda"
}

cloudwatch_logs_prefixes = [ "pushnotifi_dev" ]

name = "pushnotifi-logs"