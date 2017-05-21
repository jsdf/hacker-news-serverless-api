// @flow

'use strict';

var AWS = require('aws-sdk');

var s3 = new AWS.S3();

var bucket = 'serverless-api.hackernewsmobile.com';

module.exports = {
  put: (key /*: string */, data /*: any */) => {
    return new Promise((resolve, reject) => {
      s3.putObject(
        {
          Bucket: bucket,
          Key: `${key}.json`,
          Body: JSON.stringify(data),
          ContentType: 'application/json',
        },
        err => {
          if (err) return reject(err);
          return resolve();
        }
      );
    });
  },
};
