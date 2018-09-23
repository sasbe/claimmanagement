var mongoose = require('mongoose');

var claimSchema = mongoose.Schema({
    _id: { type: String, required: true, unique: true},
    claimdate: { type: Date, required: true },
    claimoffice: { type: String, required: true },
    claimamount: { type: Number, required: true },
    dischargedate: { type: Date },
    reimbursedamount: { type: Number },
    remarks: { type: String },
    employeeid: { type: String, required: true},
    dependentId: { type: String, required: true, default: "SELF" },
    completed: { type: Boolean },
    hospitalName: { type: String},
    admissionDate: { type:Date}

});


module.exports = mongoose.model("claims", claimSchema);