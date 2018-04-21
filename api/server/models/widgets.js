var mongoose = require('mongoose');
var widgetSchema = {
    order: { type: Number },
    limit: { type: Number, default: 10 },
    print: { type: Boolean, default: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    query: { type: Object, required: true }
}

module.exports = mongoose.model("widgets", widgetSchema);