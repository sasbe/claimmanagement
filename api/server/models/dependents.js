var mongoose = require('mongoose');


var dependentSchema = mongoose.Schema({
    _id : { type: String, required: true},
    employeeid: { type: String, required: true },
    dependentName: { type: String, required: true },
    relationshipType: { type: String, required: true },
    dob: { type: String }
});


module.exports = mongoose.model("dependents", dependentSchema);