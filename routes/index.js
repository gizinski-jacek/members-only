var express = require('express');
var router = express.Router();

const message_controller = require('../controllers/messageController');
const member_controller = require('../controllers/memberController');

/* GET home page. */
router.get('/', message_controller.message_list);

router.get('/new-message', message_controller.message_create_get);

router.post('/new-message', message_controller.message_create_post);

router.get('/sign-up', member_controller.member_create_get);

router.post('/sign-up', member_controller.member_create_post);

router.get('/log-in', member_controller.member_log_in_get);

router.post('/log-in', member_controller.member_log_in_post);

router.get('/log-out', member_controller.member_log_out_get);

router.get('/member/:username', member_controller.member_details_get);

router.post('/member/:username', member_controller.member_details_post);

module.exports = router;
