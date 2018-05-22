provider "aws" {
  region              = "${var.aws_region}"
  profile             = "${var.aws_account}"
  allowed_account_ids = ["${var.aws_account}"]
}
