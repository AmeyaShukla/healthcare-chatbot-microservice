var mongoose = require("mongoose");

var schema = mongoose.Schema;

var contextSchema = new schema({
        context_text: String,
        context_value: String,
        description: String,
});

module.exports = mongoose.model("context", contextSchema);
