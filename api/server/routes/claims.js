var express = require('express');
var router = express.Router();
//load user mongoose model
var mongoose = require('mongoose');
var User = require('../models/user');
var Dependent = require('../models/dependents');
var jwt = require('jsonwebtoken');
var SECRET = "sampleapplication";
var Claim = require('../models/claim');
var QueryMapper = require('../utils/queryMapper');
// var Counter = require('../models/counters');
var Utils = require("../utils/commonutil").getInstance();
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

router.get("/individual/:claimid", function (req, res) {
    if (req.params.claimid) {
        Claim.aggregate([{
            $match: {
                _id: req.params.claimid
            }
        },
        {
            $lookup: {
                from: 'dependents',
                localField: 'dependentId',
                foreignField: '_id',
                as: 'dependentDetails',
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'employeeid',
                foreignField: '_id',
                as: 'userDetails',
            }
        }
        ], function (err, claimArray) {
            if (!claimArray.length) {
                return Utils.throwError(res, 'Oops! It seems the claim id is wrong.')
            }
            var claim = claimArray[0];
            if (err) {
                return Utils.throwError(res, "AccessDenied");
            } else {
                if (req.decoded.employeenumber === claim.employeeid || req.decoded.role === "super") {
                    var access = "R";
                    if (req.decoded && req.decoded.role === "super") {
                        access = "W";
                    }
                    var dependent = claim.dependentDetails;
                    if (dependent.length) {
                        claim.dependentName = dependent[0].dependentName;
                    } else {
                        claim.dependentName = "SELF";
                    }
                    var user = claim.userDetails;
                    if (user.length) {
                        claim.contactnum = user[0].phone;
                    }
                    return res.json({
                        success: true,
                        access: access,
                        claim: claim
                    });
                } else {
                    return Utils.throwError(res, "AccessDenied");
                }
            }
        });
    } else {
        return Utils.throwError(res, "Oops! It seems the claim id is wrong.");
    }
})

router.get('/claimList', function (req, res, next) {
    var query = [
        {
            "context": "claims",
            "displayName": "_id",
            "type": "String",
            "name": "_id"
        },
        {
            "context": "claims",
            "displayName": "claimoffice",
            "type": "String",
            "name": "claimoffice"
        },
        {
            "context": "claims",
            "displayName": "claimdate",
            "type": "Date",
            "name": "claimdate"
        },
        {
            "context": "claims",
            "displayName": "claimamount",
            "type": "Number",
            "name": "claimamount"
        },
        {
            "context": "claims",
            "displayName": "dischargedate",
            "type": "Date",
            "name": "dischargedate"
        },
        {
            "context": "claims",
            "displayName": "reimbursedamount",
            "type": "Number",
            "name": "reimbursedamount"
        },
        {
            "context": "claims",
            "displayName": "remarks",
            "type": "String",
            "name": "remarks"
        },
        {
            "context": "claims",
            "displayName": "employeeid",
            "type": "String",
            "name": "employeeid"
        },
        {
            "context": "claims",
            "displayName": "dependentId",
            "type": "String",
            "name": "dependentId"
        },
        {
            "context": "claims",
            "displayName": "completed",
            "type": "Boolean",
            "name": "completed"
        },
        {
            "context": "claims",
            "displayName": "hospitalName",
            "type": "String",
            "name": "hospitalName"
        },
        {
            "context": "claims",
            "displayName": "admissionDate",
            "type": "Date",
            "name": "admissionDate"
        },
        {
            "context": "users",
            "displayName": "username",
            "type": "String",
            "name": "username"
        },
        {
            "context": "users",
            "displayName": "emailid",
            "type": "String",
            "name": "emailid"
        },
        {
            "context": "users",
            "displayName": "designation",
            "type": "String",
            "name": "designation"
        },
        {
            "context": "users",
            "displayName": "level",
            "type": "String",
            "name": "level"
        },
        {
            "context": "users",
            "displayName": "woffice",
            "type": "String",
            "name": "woffice"
        },
        {
            "context": "users",
            "displayName": "phone",
            "type": "String",
            "name": "phone"
        },
        {
            "context": "users",
            "displayName": "bankname",
            "type": "String",
            "name": "bankname"
        },
        {
            "context": "users",
            "displayName": "bankacnumber",
            "type": "String",
            "name": "bankacnumber"
        },
        {
            "context": "users",
            "displayName": "bankbranch",
            "type": "String",
            "name": "bankbranch"
        },
        {
            "context": "dependents",
            "displayName": "dependentName",
            "type": "String",
            "name": "dependentName"
        },
        {
            "context": "dependents",
            "displayName": "relationshipType",
            "type": "String",
            "name": "relationshipType"
        },
        {
            "context": "dependents",
            "displayName": "dob",
            "type": "String",
            "name": "dob"
        }
    ];
    // forming query criteria
    if (req.decoded) {
        var filter = {};
        if (req.query.skip) {
            filter.skip = parseInt(req.query.skip);
        }
        if (req.query.limit) {
            filter.limit = parseInt(req.query.limit);
        }
        var criteria = {
            claims:
            {
                '$and': [

                ]
            }
        };
        var claimsFilter = criteria.claims['$and'];
        var dateType = req.query.dateType ? req.query.dateType : "claimdate";
        if (req.decoded.role === "single") {
            claimsFilter.push({ 'employeeid': { '$eq': req.decoded.employeenumber } });
        } else if (req.query.empno && req.query.empno != "undefined") {
            claimsFilter.push({ 'employeeid': { '$eq': req.query.empno } });
        }
        if (req.query.claimno && req.query.claimno != "undefined") {
            claimsFilter.push({ '_id': { '$eq': req.query.claimno } });
        }
        var dateQuery = {}
        if (req.query.fromdate && req.query.fromdate !== "undefined") {
            dateQuery = {
                "$gte": new Date(req.query.fromdate)
            };
        }

        if (req.query.todate && req.query.todate !== "undefined") {
            dateQuery["$lte"] = new Date(req.query.todate)
        }
        var dateCriteria = {};
        dateCriteria[dateType] = dateQuery;
        claimsFilter.push(dateCriteria)

        Claim.aggregate(QueryMapper.buildQuery(query, filter.limit, filter.skip, criteria)).exec(function (err, results) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                return res.json({
                    success: true,
                    claims: results,
                })
            }
        })
    } else {
        return Utils.throwError(res, "AccessDenied");
    }

});

router.put('/updateClaim/:claimId', function (req, res) {
    try {
        Claim.findById(req.params.claimId, function (err, claim) {
            if (err && !claim) {
                return Utils.throwError(res, "No such claim exist");
            } else {
                if (claim.employeeid === req.decoded.employeenumber || req.decoded.role === "super") {
                    claim.dischargedate = req.body.dischargedate;
                    claim.reimbursedamount = req.body.reimbursedamount;
                    //backward compatibility
                    // claim.dependentName = claim.dependentName ? claim.dependentName : "SELF";
                    // claim.claimno = req.body.claimno;
                    claim.save(function (err) {
                        if (err) {
                            return Utils.throwError(res, "AdminError");
                        } else {
                            return res.json({
                                success: true,
                                message: "Claim details are updated"
                            });
                        }
                    })
                } else {
                    return Utils.throwError(res, "AccessDenied");
                }
            }
        });
    } catch (err) {
        next();
    }

});
router.delete("/deleteClaim/:id", function (req, res) {
    if (req.decoded && req.decoded.role === "super") {
        var id = req.params.id;
        if (id != undefined) {
            Claim.findByIdAndRemove(id, function (err) {
                if (!err) {
                    return res.json({
                        success: true,
                        message: "Claim is deleted"
                    });
                } else {
                    return Utils.throwError(res, "Oops! Could not delete the user. Contact the administrator.");
                }
            })
        } else {
            return Utils.throwError(res, "AccessDenied");
        }
    } else {
        return Utils.throwError(res, "AccessDenied");
    }
});

//add claim
router.post('/addClaim', function (req, res) {
    try {
        if (req.decoded && req.decoded.role === "super") {
            var employeeid = req.body.employeeid,
                claimdate = req.body.claimdate,
                claimamount = req.body.claimamount,
                dependentId = req.body.dependentId,
                _id = req.body._id;
            if (employeeid == null || employeeid == '' || claimdate == null || claimdate == ''
                || claimamount == null || claimamount === '' || dependentId == null || _id === '' || _id == null) {
                return Utils.throwError(res, "RequireField");
            }
            //chain operation
            // get counter of claim for the year of claim Date
            // create calimno as +1 of length
            // claim name should be either dependent name or 'SELF'
            if (dependentId == 'SELF') {
                User.findById(employeeid, function (err, user) {
                    if (err) {
                        return Utils.throwError(res, "AdminError")
                    } else if (user._id != employeeid) {
                        return Utils.throwError(res, 'This claim can not be created due to technical reason. Please consult with administrator');
                    } else {
                        var newClaims = new Claim();
                        newClaims._id = _id;
                        newClaims.claimdate = claimdate;
                        newClaims.claimoffice = user.woffice;
                        newClaims.claimamount = claimamount;
                        newClaims.employeeid = employeeid;
                        newClaims.dependentId = dependentId;
                        newClaims.save(function (saveErr) {
                            if (saveErr) {
                                return res.json({
                                    success: false,
                                    message: saveErr
                                });
                            } else {
                                return res.json({
                                    success: true,
                                    message: "Claim is created"
                                });
                            }
                        });
                    }
                })
            }
            else {
                Dependent.aggregate([{
                    $match: {
                        _id: dependentId
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: 'employeeid',
                        foreignField: '_id',
                        as: 'user'
                    }
                }
                ], function (err, result) {
                    if (result.length) {
                        var user = result[0].user[0];
                        if (err) {
                            return Utils.throwError(res, "AdminError");
                        } else if (user._id != employeeid) {
                            return Utils.throwError(res, 'This claim can not be created due to technical reason. Please consult with administrator');
                        } else {

                            var claimno = year + "_" + (count + 1);
                            var newClaims = new Claim();
                            newClaims._id = claimno;
                            newClaims.claimdate = claimdate;
                            newClaims.claimoffice = user.woffice;
                            newClaims.claimamount = claimamount;
                            newClaims.employeeid = employeeid;
                            newClaims.dependentId = dependentId;
                            newClaims.save(function (saveErr) {
                                if (saveErr) {
                                    return res.json({
                                        success: false,
                                        message: saveErr
                                    });
                                } else {
                                    return res.json({
                                        success: true,
                                        message: "Claim is created"
                                    });
                                }
                            });
                        }
                    } else {
                        return Utils.throwError(res, "AdminError");
                    }
                })
            }
        } else {
            return Utils.throwError(res, "AccessDenied");
        }
    } catch (err) {
        return Utils.throwError(res, "AdminError");
    }
});

router.post('/print', function (req, res, next) {
    var docx = officegen({
        type: 'docx',
        orientation: 'landscape'

    });
    docx.on('error', function (err) {
        return res.json({ success: false, message: "File can not be downloaded, please contact the administrator" });
    });

    var header = docx.getHeader().createP();

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
    var table = [
        [{
            val: "Claim No",
            opts: headerStyle
        }, {
            val: "Employee No",
            opts: headerStyle
        }, {
            val: "Claim Name",
            opts: headerStyle
        }, {
            val: "Claimed Date",
            opts: headerStyle
        }, {
            val: "Claim Office",
            opts: headerStyle
        }, {
            val: "Claimed Amount",
            opts: headerStyle
        }, {
            val: "Contact No",
            opts: headerStyle
        }, {
            val: "Discharge Date",
            opts: headerStyle
        }, {
            val: "Reimbursed Amount",
            opts: headerStyle
        }, {
            val: "Remarks",
            opts: headerStyle
        }]
    ]
    var datum = req.body;

    if (datum) {
        for (var i = 0, j = 1, length = datum.length; i < length; i++ , j++) {
            var row = datum[i];
            var rowArray = [
                row._id,
                row.employeeid,
                row.claimname,
                row.claimdate,
                row.claimoffice,
                row.claimamount,
                row.contactnum,
                row.dischargedate ? row.dischargedate : '',
                row.reimbursedamount ? row.reimbursedamount : '',
                row.remarks ? row.remarks : ''
            ];
            table[j] = rowArray;
        }
    }

    var tableStyle = {
        tableAlign: "left",
        tableFontFamily: "Calibri",
        borders: true,
        tableColWidth: 3000,
        tableSize: 22
    }

    var pObj = docx.createTable(table, tableStyle);
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