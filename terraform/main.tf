resource "aws_s3_bucket" "source" {
  bucket = "${var.stage}-${var.name}-${var.aws_region}-pipeline-lambdas"
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
    image           = "aws/codebuild/nodejs:6.3.1"
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
      name  = "SSM_LOGZ_IO_TOKEN_KEY"
      value = "${var.ssm_logz_io_token_key}"
    }

    environment_variable {
      name  = "CLOUDWATCH_LOGS_PREFIXES"
      value = "${join(",", var.cloudwatch_logs_prefixes)}"
    }

    environment_variable {
      name  = "RETENTION_DAYS"
      value = "${var.retention_days}"
    }

    environment_variable {
      name  = "NAME"
      value = "${var.name}"
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
