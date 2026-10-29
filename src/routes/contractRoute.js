const router = require('express').Router();
const controller = require('../controllers/contractController');
const requireApiKey = require('../middlewares/requireApiKey');

router.get('/', controller.list);
router.get('/tx/:hash', controller.txStatus);
router.get('/:name/events/:event', controller.events);
router.post('/:name/read/:method', controller.read);
router.post('/:name/write/:method', requireApiKey, controller.write); // writes need an API key

module.exports = router;