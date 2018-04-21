var express = require('express');
var router = express.Router();
//load user mongoose model
var mongoose = require('mongoose');
var User = require('../models/user');
var Dependent = require('../models/dependents');
var Claim = require('../models/claim');
var Widget = require('../models/widgets');
var QueryMapper = require('../utils/queryMapper');
var util = require('../utils/commonutil').getInstance();
var jwt = require('jsonwebtoken');
var SECRET = "sampleapplication";

router.use(function(req, res, next) {
    try {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, SECRET, function(err, decoded) {
                if (err) {
                    res.redirect('/');
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.json({ success: false, message: err });
    }
});
router.post('/', function(req, res) {
    if (req.decoded && req.decoded.role === "super" && req.body.widget) {
        let widget = new Widget();
        let reqWidget = req.body.widget;
        widget.name = reqWidget.name;
        widget.description = reqWidget.description;
        widget.order = Number(reqWidget.order);
        widget.print = Number(reqWidget.limit);
        widget.print = Boolean(reqWidget.print);
        widget.query = reqWidget.query;
        widget.save(function(err) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else {
                return res.json({
                    success: true
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Oops! You are trying something that is not supported"
        });

    }
});
router.put('/', function(req, res) {
    if (req.decoded && req.decoded.role === "super" && req.body.widget) {
        let reqWidget = req.body.widget;
        Widget.findByIdAndUpdate(reqWidget._id, {
            name: reqWidget.name,
            description: reqWidget.description,
            order: Number(reqWidget.order),
            print: Boolean(reqWidget.print),
            limit: Number(reqWidget.limit),
            query: reqWidget.query
        }, function(err) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else {
                return res.json({
                    success: true
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Oops! You are trying something that is not supported"
        });

    }
});
router.get('/', function(req, res, next) {
    if (req.decoded && req.decoded.role === "super") {
        Widget.find(function(err, widgets) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else {
                return res.json({
                    success: true,
                    "widgets": widgets
                });
            }
        })
    } else {
        return res.redirect('/');
    }
});
router.get('/schemadetails', function(req, res, next) {
    res.json({
        schemas: [{
                "claims": util.omit(Claim.schema.paths, ["_id", "__v", "_dependentId"])
            },
            {
                'users': util.omit(User.schema.paths, ["_id", "__v", "password", "employeenumber"])
            },
            {
                'dependents': util.omit(Dependent.schema.paths, ["_id", "__v", "employeeid"])
            }
        ]
    });
});
router.delete("/:id", function(req, res) {
    if (req.decoded && req.decoded.role === "super") {
        var id = req.params.id;
        if (id != undefined) {
            Widget.findByIdAndRemove(id, function(err) {
                if (!err) {
                    return res.json({
                        success: true,
                        message: "Widget has been removed"
                    });
                } else {
                    return res.json({
                        success: false,
                        message: "Oops! Could not delete the widget. Contact the administrator."
                    });
                }
            })
        } else {
            return res.json({
                success: false,
                message: "Oops! You are trying something that is not supported"
            });

        }
    } else {
        return res.json({
            success: false,
            message: "Oops! You are trying something that is not supported"
        });
    }
});

router.get('/widgetlist', function(req, res, next) {
    if (req.decoded && req.decoded.role === "super") {
        Widget.find({}, "name description _id", function(err, widgets) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else {
                return res.json({
                    success: true,
                    "widgets": widgets
                });
            }
        })
    } else {
        //don't show widget to non-super user
        return res.json({
            success: true,
            "widgets": []
        });
    }
});

router.get('/:id', function(req, res, next) {
    if (req.decoded && req.decoded.role === "super") {
        Widget.findById(req.params.id, 'query print limit description', function(err, widget) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else {
                //get claim table record
                Claim.aggregate(QueryMapper.buildQuery(widget.query)).exec(function(err, results) {
                    if (!err) {
                        return res.json({
                            success: true,
                            columns: widget.query,
                            limit: widget.limit,
                            records: results,
                            description: widget.description
                        })
                    }
                })
            }

        });
    } else {
        return res.json({
            success: false,
            message: "Oops! You are trying something that is not supported"
        });
    }
})

module.exports = router;