// @flow

'use strict';

var hn = require('hacker-news-api-client');

var store = require('./store');

/*::

type ItemType = 'comment' | 'story' | 'poll' | 'job';

type Comment = {
  by: string,
  id: number,
  parent: number,
  text: string,
  time: number,
  type: 'comment',
};

type StoryData = {
  comments: Array<Comment>,
  story: {
    by: string,
    descendants: number,
    id: number,
    kids: Array<number>,
    score: number,
    time: number,
    title: string,
    type: ItemType,
    url: string
  },
};

*/

function fetchStory(id /*: number */) /* : Promise<StoryData> */ {
  return hn.fetchStory(id);
}

function getTopStoryIds() /* : Promise<Array<number>> */ {
  return hn.getTopStoryIds();
}

module.exports.cron = (
  event /*: Object */,
  context /*: Object */,
  callback /*: (err: ?Object, result: ?Object) => void */
) => {
  getTopStoryIds()
    .then(ids => Promise.all(ids.map(fetchStory)))
    .then((stories /*: Array<StoryData>*/) => {
      var topStories = [];
      var storyPromises = stories
        .filter(story => story.story.type === 'story')
        .map(data => {
          var descendentIds = [];
          data.comments.forEach(c => {
            descendentIds.push(c.id);
          });
          var storyRecord = Object.assign({}, data.story, {
            descendentIds,
            comments: data.comments,
          });

          const topStory = Object.assign({}, data.story);
          delete topStory.kids;

          topStories.push(topStory);

          // write this story
          return store.put(`stories/${storyRecord.id}`, storyRecord);
        });

      return Promise.all(storyPromises).then(() => {
        return store.put('topstories', topStories);
      });
    })
    .catch(err => {
      callback(err, {
        message: 'fail! ' + err,
      });
    })
    .then(() => {
      callback(null, {
        message: 'function executed successfully!',
      });
    });
};
