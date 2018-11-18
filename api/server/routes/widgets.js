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

var async = require('async');
var officegen = require('officegen');

var fs = require('fs');
var path = require('path');

router.use(function (req, res, next) {
    try {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, SECRET, function (err, decoded) {
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
router.post('/', function (req, res) {
    if (req.decoded && req.decoded.role === "super" && req.body.widget) {
        let widget = new Widget();
        let reqWidget = req.body.widget;
        widget.name = reqWidget.name;
        widget.description = reqWidget.description;
        widget.order = Number(reqWidget.order);
        widget.print = Number(reqWidget.limit);
        widget.print = Boolean(reqWidget.print);
        widget.query = reqWidget.query;
        widget.filters = reqWidget.filters ? JSON.stringify(reqWidget.filters) : '{}';
        widget.save(function (err) {
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
router.put('/', function (req, res) {
    if (req.decoded && req.decoded.role === "super" && req.body.widget) {
        let reqWidget = req.body.widget;
        Widget.findByIdAndUpdate(reqWidget._id, {
            name: reqWidget.name,
            description: reqWidget.description,
            order: Number(reqWidget.order),
            print: Boolean(reqWidget.print),
            limit: Number(reqWidget.limit),
            query: reqWidget.query
        }, function (err) {
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
router.get('/', function (req, res, next) {
    if (req.decoded && req.decoded.role === "super") {
        Widget.find({}, "", {
            sort: { order: 1 }
        }, function (err, widgets) {
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
router.get('/schemadetails', function (req, res, next) {
    let columnDefintions = [];
    res.json({
        schemas: columnDefintions.concat(util.getColumnDefinitions('claims', Claim.schema.paths, ["__v", "_dependentId"])
            , util.getColumnDefinitions('users', User.schema.paths, ["_id", "__v", "password", "employeenumber"]),
            util.getColumnDefinitions('dependents', Dependent.schema.paths, ["_id", "__v", "employeeid"]))

    });
});
router.delete("/:id", function (req, res) {
    if (req.decoded && req.decoded.role === "super") {
        var id = req.params.id;
        if (id != undefined) {
            Widget.findByIdAndRemove(id, function (err) {
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

router.get('/widgetlist', function (req, res, next) {
    if (req.decoded && req.decoded.role === "super") {
        Widget.find({}, "name description _id", { sort: { order: 1 } },

            function (err, widgets) {
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

router.get('/:id', function (req, res, next) {
    if (req.decoded && req.decoded.role === "super") {
        Widget.findById(req.params.id, 'query print limit description filters', function (err, widget) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else {
                //get claim table record
                Claim.aggregate(QueryMapper.buildQuery(widget.query, widget.limit, req.query.skip, widget.filters)).exec(function (err, results) {
                    if (!err) {
                        return res.json({
                            success: true,
                            columns: widget.query,
                            limit: widget.limit,
                            print: widget.print,
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
});

router.post("/print", function (req, res, next) {
    var docx = officegen({
        type: 'docx',
        subject: 'Claim list',
        author: 'NTC',
        orientation: 'landscape'

    });

    docx.on('error', function (err) {
        return res.json({ success: false, message: "File can not be downloaded, please contact the administrator" });
    });



    var header = docx.getHeader().createP();
    header.addImage('public/downloads/ntc.png');
    header.addText("Nepal Telecom", {
        align: "Center",
        font_size: 15,
        font_face: 'Times New Roman',
        bold: true
    });
    header.addHorizontalLine();
    var headerStyle = {
        b: true,
        fontFamily: "FONTASY_ HIMALI_ TT",
        sz: '22'
    };
    var tableStyle = {
        tableAlign: "left",
        tableFontFamily: "Calibri",
        borders: true,
        tableColWidth: 3000,
        tableSize: 22
    }
    var columns = req.body.columns;
    var headers = [];
    columns.forEach(element => {
        headers.push({
            val: element.displayName,
            opts: headerStyle
        })
    });
    var tableContent = [headers].concat(req.body.tableContent);
    var pObj = docx.createTable(tableContent, tableStyle);
    var out = fs.createWriteStream('public/downloads/out.docx', { flags: 'w' });

    out.on('error', function (err) {
        return res.json({ success: false, message: "File can not be downloaded, please contact the administrator" });
    });

    async.parallel([
        function (done) {
            out.on('close', function () {
                console.log('Finish to create a DOCX file.');
                res.json({ success: true, url: "downloads/out.docx" });
            });
            docx.generate(out);
        }

    ], function (err) {
        if (err) {
            return res.json({ success: false, message: "File can not be downloaded, please contact the administrator" });
        } // Endif.
    });

});


module.exports = router;