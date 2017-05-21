# hacker-news-serverless-api
A hacker news API published as JSON files on S3 by an AWS Lambda function 

Top stories: https://serverless-api.hackernewsmobile.com/topstories.json

Once you have the top stories IDs you can get individual story data from: `/stories/[story ID].json`

eg. https://serverless-api.hackernewsmobile.com/stories/14380625.json


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
