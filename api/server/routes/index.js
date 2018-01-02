var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var SECRET = "sampleapplication";


/* GET home page. base url*/
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Claim Management' });
});
module.exports = router;