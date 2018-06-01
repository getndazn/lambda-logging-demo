aws_account = "144992683770"

aws_region = "eu-central-1"

ssm_logz_io_token_key = "/stage/lambda/logzio-token"

stage = "stage"

tags = {
  Application = "dazndev"
  Description = "log shipping lambda"
}

cloudwatch_logs_prefixes = [
  "/aws/lambda/be_stage_jappred-web",
  "/aws/lambda/be_stage_rs-translations-web-api",
  "/aws/lambda/be_stage_rs-web",
  "/aws/lambda/be_stage_rs-articles",
  "/aws/lambda/be_stage_rs-labels",
  "/aws/lambda/be_stage_s3-buckets-replication",
  "/aws/lambda/be_stage_push-notification-device-registration",
  "/aws/lambda/be_stage_push-notification-sender",
  "/aws/lambda/be_stage_notifi"
]
name = "cloudwatch-logs"