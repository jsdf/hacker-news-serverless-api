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
  itemIds: Array<number>,
};

*/

/*::
declare function time<T>(promise: Promise<T>, msg: string): Promise<T>;
*/

function time(promise, msg) {
  console.time(msg);
  return promise.then(val => {
    console.timeEnd(msg);
    return val;
  });
}

function fetchStory(
  id /*: number */,
  knownItemIds /*: Array<number>*/
) /* : Promise<StoryData> */ {
  return hn.fetchStory(id, knownItemIds);
}

function getTopStoryIds() /* : Promise<Array<number>> */ {
  return hn.getTopStoryIds();
}

module.exports.cron = (
  event /*: Object */,
  context /*: Object */,
  callback /*: (err: ?Object, result: ?Object) => void */
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('starting');
  var topStoriesLoaded = {};
  let topStoryIds = [];
  let idCache = {};
  store
    .get('id-cache')
    .then(idCacheData => {
      if (idCacheData) {
        try {
          idCache = JSON.parse(idCacheData.Body.toString());
          console.log('warmed id cache');
        } catch (err) {
          console.error(err);
        }
      }
    })
    .then(() => time(getTopStoryIds(), 'getTopStoryIds'))
    .then(ids => {
      console.log('got topstory ids');
      topStoryIds = ids;
      const storyPromises = topStoryIds.map(id =>
        time(fetchStory(id, idCache[id]), `fetchStory ${id}`)
          .then((storyData /*: StoryData*/) => {
            if (storyData.story.type !== 'story') {
              return Promise.resolve(null);
            }

            var descendentIds = [];
            storyData.comments.forEach(c => {
              descendentIds.push(c.id);
            });
            var storyRecord = Object.assign({}, storyData.story, {
              descendentIds,
              comments: storyData.comments,
            });

            const topStory = Object.assign({}, storyData.story);
            delete topStory.kids;

            idCache[id] = storyData.itemIds;

            topStoriesLoaded[topStory.id] = topStory;

            // write this story
            return store.put(`stories/${storyRecord.id}`, storyRecord);
          })
          .then(() => Promise.resolve(null))
      );
      return Promise.all(storyPromises);
    })
    .then(() => {
      console.log('writing top stories');
      const topStoriesOrdered = topStoryIds
        .filter(id => topStoriesLoaded[id])
        .map(id => topStoriesLoaded[id]);

      return Promise.all([
        store.put('id-cache', idCache),
        store.put('topstories', topStoriesOrdered),
        store.put('topstories-25-0', topStoriesOrdered.slice(0, 25)),
        store.put('topstories-25-1', topStoriesOrdered.slice(25, 50)),
        store.put('topstories-25-2', topStoriesOrdered.slice(50, 75)),
        store.put('topstories-25-3', topStoriesOrdered.slice(75, 100)),
      ]);
    })
    .then(() => {
      console.log('wrote top stories');
      callback(null, {
        message: 'function executed successfully!',
      });
    })
    .catch(err => {
      console.log('got an error');
      callback(err, {
        message: 'fail! ' + err,
      });
    });
};
