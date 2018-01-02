var express = require("express");
var router = express.Router();

router.get('/errorcount', function(req, res) {
    res.send({ errorCount: 0 });
});

module.exports = router;