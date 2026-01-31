try {
    console.log('Testing Joi...');
    require('joi');
    console.log('Joi OK');

    console.log('Testing Winston...');
    require('winston');
    console.log('Winston OK');

    console.log('Testing Redis...');
    require('redis');
    console.log('Redis OK');

    console.log('Testing Logger Util...');
    require('./util/logger');
    console.log('Logger Util OK');

    console.log('Testing Validation Middleware...');
    require('./middleware/validation');
    console.log('Validation MW OK');

    console.log('Testing Cache Middleware...');
    require('./middleware/cache');
    console.log('Cache MW OK');

    console.log('Testing Server dependencies...');
    require('express-mongo-sanitize');
    require('express-xss-sanitizer');
    require('helmet');
    console.log('Server dependencies OK');

} catch (e) {
    console.error('CRASH DETECTED:');
    console.error(e.message);
    console.error(e.code);
}
