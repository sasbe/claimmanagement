// load mongoose package
var mongoose = require('mongoose');
var Dependent = require('../server/models/dependents');
var User = require('../server/models/user');
var fs = require('fs');
// Use native Node promises
mongoose.Promise = global.Promise;
var readXlsxFile = require('read-excel-file/node');
const schema = {
        'EMPNO': {
            prop: 'employeeid',
            required: true,
            parse(value) {
                const number = Number(value)
                if (!number) {
                    throw new Error('invalid')
                }
                return number
            }
        },
        'DEPENDENT NAME': {
            prop: 'dependentName',
            type: String,
            required: true
        },
        'RELATIONSHIP': {
            prop: 'relationshipType',
            required: true,
            type: String
        },
        'AGE': {
            prop: 'age',
            type: Number
        }
    }
    // connect to MongoDB

mongoose.connect('mongodb://127.0.0.1/claim')
    .then(() => {
        console.log('connection succesful');
        console.log('Importing Document');
        User.find({}, "employeenumber", function(error, users) {
            readXlsxFile(fs.createReadStream("D:\\data\\Dependentlist\\dl1.xlsx"), { schema, sheet: 2 }).then(({ rows, errors }) => {
                if (errors.length > 0) {
                    console.log(errors);
                    return;
                }
                var data = [];
                var errorData = [];
                rows.forEach(element => {
                    var foundEmp = users.find(function(user) {
                        return user.employeenumber == element.employeeid;
                    })
                    if (foundEmp) {
                        element.employeeid = mongoose.Types.ObjectId(foundEmp.id);
                        data.push(element);
                    } else {
                        errorData.push(element);
                    }
                });
                console.log("Out of " + rows.length + "," + data.length + " will be inserted");
                console.log("Invalid data size " + errorData.length);
                Dependent.insertMany(data, function(error, docs) {
                    if (error) {
                        console.log(error);
                    }
                    console.log("Out of " + data.length + ", " + docs.length + ' are inserted');
                });
            });
        });

    })
    .catch((err) => console.error(err));