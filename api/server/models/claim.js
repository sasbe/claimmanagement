var mongoose = require('mongoose');


var claimSchema = mongoose.Schema({
    claimno: { type: Number, required: true },
    claimdate: { type: Date, required: true },
    claimoffice: { type: String, required: true },
    claimname: { type: String, required: true },
    claimamount: { type: Number, required: true },
    contactnum: { type: Number, required: true },
    dischargedate: { type: Date },
    reimbursedamount: { type: Number },
    remarks: { type: String },
    empno: { type: Number, required: true, lowercase: true },
    completed: { type: Boolean }
});


module.exports = mongoose.model("claims", claimSchema);