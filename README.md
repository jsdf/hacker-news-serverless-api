# hacker-news-serverless-api
A hacker news API published as JSON files on S3 by an AWS Lambda function 

Top stories: https://s3-us-west-2.amazonaws.com/hacker-news-serverless-api/topstories.json

Once you have the top stories IDs you can get individual story data from: `/stories/[story ID].json`

eg. https://s3-us-west-2.amazonaws.com/hacker-news-serverless-api/stories/14380625.json


### running it yourself

after cloning this repo, run `yarn` to get things started

then:

run it locally
```bash
node runItLocally.js
```

deploy it
```bash
serverless deploy -v
```
