<<<<<<< HEAD
/* eslint-disable no-process-env */
'use strict';

||||||| parent of 23d9c03... v3.11.0...v3.21.2
=======
'use strict';

>>>>>>> 23d9c03... v3.11.0...v3.21.2
module.exports = {
<<<<<<< HEAD
	test_page: 'tests/index.html?hidepassed',
	disable_watching: true,
	launch_in_ci: [
		'Chrome'
	],
	launch_in_dev: [
		'Chrome'
	],
	browser_args: {
		Chrome: [
			process.env.TRAVIS ? '--no-sandbox' : null,
			'--disable-gpu',
			'--headless',
			'--remote-debugging-port=0',
			'--window-size=1440,900'
		].filter(Boolean)
	}
||||||| parent of 23d9c03... v3.11.0...v3.21.2
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: [
    'Chrome'
  ],
  launch_in_dev: [
    'Chrome'
  ],
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
      ].filter(Boolean)
    }
  }
=======
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: [
    'Chrome'
  ],
  launch_in_dev: [
    'Chrome'
  ],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
      ].filter(Boolean)
    }
  }
>>>>>>> 23d9c03... v3.11.0...v3.21.2
};
