var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var SECRET = "sampleapplication";
module.exports = function(app, passport) {

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));
    passport.serializeUser(function(user, done) {
        token = jwt.sign({
            username: user.username,
            emailid: user.emailid
        }, SECRET, { expiresIn: '1h' });
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    passport.use(new FacebookStrategy({
            clientID: '314487765658456',
            clientSecret: '9e0e8828296e865b15a316c0a14b75b9',
            callbackURL: "http://localhost:3000/auth/facebook/callback",
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
                emailid: profile._json.email
            }, 'username emailid password', function(err, user) {
                if (err) {
                    done(err);
                } else if (user && user.emailid != null) {
                    done(null, user);
                } else {
                    done(err);
                }
            });
            // done(null, profile);
        }
    ));
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: "email" }));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/facebookerror'
        }),
        function(req, res) {
            res.redirect('/facebook/' + token)
        });
};