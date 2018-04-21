var mongoose = require('mongoose');


var dependentSchema = mongoose.Schema({
    employeeid: { type: mongoose.SchemaTypes.ObjectId, required: true },
    dependentName: { type: String, required: true },
    relationshipType: { type: String, required: true }
});


module.exports = mongoose.model("dependents", dependentSchema);