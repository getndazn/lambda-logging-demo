aws_account = "728650748678"

aws_region = "ap-northeast-1"

ssm_logz_io_token_key = "/prod/lambda/logzio-token"

stage = "prod"

tags = {
  Application = "dazndev"
  Description = "log shipping lambda"
}

cloudwatch_logs_prefixes = [
  "/aws/lambda/be_prod_jappred-web",
  "/aws/lambda/be_prod_rs-translations-web-api",
  "/aws/lambda/be_prod_rs-web",
  "/aws/lambda/be_prod_rs-articles",
  "/aws/lambda/be_prod_rs-labels",
  "/aws/lambda/be_prod_s3-buckets-replication",
  "/aws/lambda/be_prod_push-notification-device-registration",
  "/aws/lambda/be_prod_push-notification-sender",
  "/aws/lambda/be_prod_notifi",
  "pushnotifi_prod",
]

name = "cloudwatch-logs"
