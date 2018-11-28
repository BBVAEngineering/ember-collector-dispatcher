# ember-collector-dispatcher

[![Build Status](https://travis-ci.org/BBVAEngineering/ember-collector-dispatcher.svg?branch=master)](https://travis-ci.org/BBVAEngineering/ember-collector-dispatcher)
[![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-collector-dispatcher.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-collector-dispatcher)
[![NPM version](https://badge.fury.io/js/ember-collector-dispatcher.svg)](https://badge.fury.io/js/ember-collector-dispatcher)
[![Dependency Status](https://david-dm.org/BBVAEngineering/ember-collector-dispatcher.svg)](https://david-dm.org/BBVAEngineering/ember-collector-dispatcher)
[![codecov](https://codecov.io/gh/BBVAEngineering/ember-collector-dispatcher/branch/master/graph/badge.svg)](https://codecov.io/gh/BBVAEngineering/ember-collector-dispatcher)
[![Greenkeeper badge](https://badges.greenkeeper.io/BBVAEngineering/ember-collector-dispatcher.svg)](https://greenkeeper.io/)
[![Ember Observer Score](https://emberobserver.com/badges/ember-collector-dispatcher.svg)](https://emberobserver.com/addons/ember-collector-dispatcher)

## Information

[![NPM](https://nodei.co/npm/ember-collector-dispatcher.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ember-collector-dispatcher/)

Collect and dispatch elements in your progressive web app.

## Installation

`ember install ember-collector-dispatcher`

## Configuring your collector

You need to extend the collector service:

```javascript
// app/services/my-collector.js

export default Collector.extend({
  adapters: [
    ['indexed-db', { database: 'logs' }],
    ['local-storage', { key: 'logs' }],
    'memory'
  ]
});
```

You also need to define `adapters` with the possible storages. Now, you can choose: indexeddb, local-storage and memory.

You can add as many adapters as you want. Only must implements the following methods:

|     Method    |                                        Description                                        |
|:-------------:|:-----------------------------------------------------------------------------------------:|
| `isSupported` |              Returns `true` if the storage is supported; otherwise, `false`.              |
|    `count`    |                       Returns the number of elements in the storage.                      |
|     `push`    |                    Adds one or more elements to the end of the storage.                   |
|   `unshift`   |                 Adds one or more elements to the beginning of the storage.                |
|     `pop`     |    Removes one or more elements from the end of the storage and returns that elements.    |
|    `shift`    | Removes one or more elements from the beginning of the storage and returns that elements. |

## Configuring your dispatcher

You need to extend the dispatcher service:

```javascript
// app/services/my-dispatcher.js

export default Dispatcher.extend({
  collector: service('my-collector'),
  maxTimeout: 30000,
  maxConcurrent: 5,

  async dispatch(items) {
    // my dispatch logic...

    return [undispatchedItems];
  }
})
```

You also need to define the following properties:

|     Property    |                                                       Description                                                       |
|:---------------:|:-----------------------------------------------------------------------------------------------------------------------:|
|   `collector`   |                                               Collector service injection.                                              |
|   `maxTimeout`  | Max time, in milliseconds (thousandths of a second), the dispatcher should wait before the dispatch method is executed. |
| `maxConcurrent` |                         Max number of items that the dispatcher can be process during the loop.                         |
|    `dispatch`   |                                                Dispatch items as you want                                               |

## Contribute

If you want to contribute to this addon, please read the [CONTRIBUTING.md](CONTRIBUTING.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/BBVAEngineering/ember-collector-dispatcher/tags).

## Authors

See the list of [contributors](https://github.com/BBVAEngineering/ember-collector-dispatcher/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
