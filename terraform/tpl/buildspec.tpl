version: 0.2


phases:
  pre_build:
    commands:
      - echo Exited the pre_build phase...
  build:
    commands:
      - npm install
      - node_modules/.bin/sls deploy --stage ${stage} --region ${region}

  post_build:
    commands:
      - echo Build completed on `date`
