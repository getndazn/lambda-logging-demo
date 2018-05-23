aws_account = "728650748678"

aws_region = "us-east-1"

ssm_logz_io_token_key = "/prod/lambda/logzio-token"

stage = "prod"

tags = {
  Application = "dazndev"
  Description = "log shipping lambda"
}

cloudwatch_logs_prefixes = [ "/aws/lambda" ]

name = "cloudwatch-logs"
