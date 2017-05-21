// @flow

'use strict';

require('./handler').cron({}, {}, (err, data) => {
  if (err) return console.error(err, data);
  console.log(data);
});
