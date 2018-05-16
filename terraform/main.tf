resource "aws_s3_bucket" "source" {
  bucket = "${var.stage}-${var.name}-pipeline"
  acl    = "private"

  tags = "${var.tags}"
}

data "template_file" "buildspec" {
  template = "${file("${path.module}/tpl/buildspec.tpl")}"

  vars {
    stage  = "${var.stage}"
    region = "${var.aws_region}"
  }
}

/*
* Secret
*/

data "aws_kms_secret" "logstash" {
  secret {
    name    = "token"
    payload = "${var.logz_io_token_kms_ciphertext}"

    context {
      env = "${var.stage}"
    }
  }
}

/*
/* CodeBuild
*/
resource "aws_codebuild_project" "dazndev_build" {
  name          = "${var.stage}-${var.name}-project"
  build_timeout = "10"
  service_role  = "${aws_iam_role.codebuild_role.arn}"

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"

    // https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html
    image           = "aws/codebuild/docker:17.09.0"
    type            = "LINUX_CONTAINER"
    privileged_mode = true

    environment_variable {
      name  = "LOGSTASH_HOST"
      value = "${var.logstash_host}"
    }

    environment_variable {
      name  = "LOGSTASH_PORT"
      value = "${var.logstash_port}"
    }

    environment_variable {
      name  = "LOGSTASH_TOKEN"
      value = "${data.aws_kms_secret.logstash.token}"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "${data.template_file.buildspec.rendered}"
  }

  tags = "${var.tags}"
}

/* CodePipeline */

resource "aws_codepipeline" "pipeline" {
  name     = "${var.stage}-${var.name}"
  role_arn = "${aws_iam_role.codepipeline_role.arn}"

  artifact_store {
    location = "${aws_s3_bucket.source.bucket}"
    type     = "S3"
  }

  stage {
    name = "Clone_from_github"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "ThirdParty"
      provider         = "GitHub"
      version          = "1"
      output_artifacts = ["source"]

      configuration {
        Owner                = "${var.lambda_git_owner}"
        Repo                 = "${var.lambda_git_repo}"
        Branch               = "${var.lambda_git_branch}"
        PollForSourceChanges = "no"
      }
    }
  }

  stage {
    name = "Build_and_push_docker_image"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source"]
      output_artifacts = []

      configuration {
        ProjectName = "${aws_codebuild_project.dazndev_build.name}"
      }
    }
  }
}
