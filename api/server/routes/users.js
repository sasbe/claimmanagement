var express = require('express');
var router = express.Router();
//load user mongoose model
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SECRET = "sampleapplication";
var excludePath = ['/users/authenticate'];

router.use(function (req, res, next) {
    console.log("middle ware");
    if (excludePath.indexOf(req.originalUrl) != -1) {
        next();
    } else {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, SECRET, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: "Invalid token" });
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            res.redirect('/');
        }
    }
});
router.get('/userList', function (req, res, next) {
    // forming query criteria
    if (req.decoded && req.decoded.role === "super") {
        var filter = {};
        if (req.query.skip) {
            filter.skip = parseInt(req.query.skip);
        }
        if (req.query.limit) {
            filter.limit = parseInt(req.query.limit);
        }
        var criteria = {};
        if (req.query.empno && req.query.empno != "undefined") {
            criteria.employeenumber = parseInt(req.query.empno);
        }

        User.find(
            criteria, "username emailid employeenumber designation level woffice role", filter,
            function (err, users) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    return res.json({
                        success: true,
                        users: users
                    });
                }
            })
    } else {
        return res.redirect('/');
    }

});
router.get("/search/:searchKey", function (req, res) {
    try {
        if (req.decoded && req.decoded.role == "super" && req.params.searchKey != "undefined") {
            let empno = Number(req.params.searchKey);
            let query = { employeenumber: { $eq: empno } };
            User.find(query, "username employeenumber", function (err, users) {
                if (err) {
                    return res.json({
                        users: []
                    });
                } else {
                    res.json({
                        users: users
                    });
                }
            });
        }
    }
    catch (e) {
        return res.json({
            users: []
        });
    }
});
router.get("/individual/:userid", function (req, res) {
    if (req.decoded && req.decoded.role == "super" && req.params.userid != "undefined") {
        User.findById(req.params.userid, function (err, user) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Something went wrong. Please contact the administrator"
                });
            } else {

                res.json({
                    success: true,
                    user: user
                });
            }
        });
    } else {
        return res.redirect('/');
    }
});
router.put('/updateUser/:userId', function (req, res) {
    if (req.decoded && req.decoded.role === "super") {

        var update = req.body.user;
        User.findByIdAndUpdate(req.params.userId, {
            username: update.username,
            emailid: update.emailid,
            designation: update.designation,
            level: update.level,
            woffice: update.woffice,
            phone: update.phone
        }, function (err, user) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else {
                return res.json({
                    success: true,
                    message: "User details are updated"
                });
            }
        });
    } else {
        return res.redirect('/');
    }
});

router.post('/changePassword/:userId', function (req, res) {
    console.log("dasd" + req.params.userId)
    if (req.decoded && req.decoded.employeenumber == req.params.userId) {
        User.findOne({ employeenumber: req.params.userId }, function (err, user) {
            console.log(user)
            if (err) {
                return res.json({
                    success: false,
                    message: "Server failure. Please contact the administrator"
                });
            } else if (req.body && user && user.comparePassword(req.body.oldP || "") &&
                req.body.newP == req.body.confirmP) {
                user.password = req.body.newP;
                user.save(function (err) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: "User details are updated"
                        });
                    }
                })
            } else {
                return res.json({
                    success: false,
                    message: "Some thing wrong with the password details"
                });
            }
        });
    } else {
        return res.json({
            success: false,
            message: "Server failure. Please contact the administrator"
        });
    }
});

router.post('/authenticate', function (req, res) {
    console.log(req.body.employeenumber);
    User.findOne({
        employeenumber: req.body.employeenumber
    }, 'username emailid password employeenumber role', function (err, user) {
        if (err) {
            return res.json({ success: false, message: err });
        } else {
            console.log(user);
            if (!user) {
                return res.json({ success: false, message: "User does not exist" });
            } else {
                var isValidPassword = user.comparePassword(req.body.password || "");
                console.log(isValidPassword + req.body.password);
                if (!isValidPassword) {
                    return res.json({ success: false, message: "Could not authenticate password" });
                } else {
                    console.log(true);
                    var token = jwt.sign({
                        username: user.username,
                        emailid: user.emailid,
                        employeenumber: user.employeenumber,
                        role: user.role
                    }, SECRET, { expiresIn: '1h' });
                    return res.json({ success: true, message: "User authenticate", token: token });
                }
            }
        }

    });
});

router.post('/createUser', function (req, res) {
    if (req.decoded && req.decoded.role === "super") {
        var username = req.body.username,
            password = req.body.password,
            emailid = req.body.emailid,
            employeenumber = req.body.employeeno,
            designation = req.body.designation,
            level = req.body.level,
            woffice = req.body.level;

        if (username == null || username == '' || emailid == null || emailid == '' || password == null || password == '' ||
            employeenumber == null || employeenumber == '' || designation == null || designation == '' || level == null || level == '' ||
            woffice == null || woffice == '') {
            console.log("false");
            return res.json({ success: false, message: "Ensure username, emaild and password were provided" })
        }
        var newUser = new User();
        newUser.username = username;
        newUser.password = password;
        newUser.emailid = emailid;
        newUser.designation = designation;
        newUser.employeenumber = employeenumber;
        newUser.level = level;
        newUser.woffice = woffice;
        newUser.role = "single";
        newUser.save(function (err) {
            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "User already exists"
                });
            } else {
                return res.json({
                    success: true,
                    message: "User is created"
                });
            }
        });
    } else {
        return res.json({
            success: false,
            message: "Oops! You are trying something that is not supported"
        });
    }
});



//give the user profile
router.post('/me', function (req, res) {
    console.log(req.decoded);
    res.send({
        success: true,
        userDetails: req.decoded
    });
});


router.delete("/deleteUser/:id", function (req, res) {
    if (req.decoded && req.decoded.role === "super") {
        var id = req.params.id;
        if (id != undefined) {
            User.findByIdAndRemove(id, function (err) {
                if (!err) {
                    return res.json({
                        success: true,
                        message: "User is deleted"
                    });
                } else {
                    return res.json({
                        success: true,
                        message: "Oops! Could not delete the user. Contact the administrator."
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
module.exports = router;