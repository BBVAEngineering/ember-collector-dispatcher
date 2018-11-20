(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['Dexie'],
      __esModule: true,
    };
  }

  define('dexie', [], vendorModule);
})();
