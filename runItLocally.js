// @flow

'use strict';

require('./handler').cron({}, {}, (err, data) => {
  if (err) {
    console.error(err, data);
    process.exit(1);
  }
  console.log(data);
  process.exit(0);
});
