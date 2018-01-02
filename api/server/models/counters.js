var mongoose = require('mongoose');
var counterSchema = {
    "_id": { type: String, required: true },
    "sequence_value": { type: Number, default: 0 }
}
module.exports = mongoose.model("counters", counterSchema);