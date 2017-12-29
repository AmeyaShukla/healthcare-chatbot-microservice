var mongoose = require("mongoose");

var schema = mongoose.Schema;

var diagonosisSchema = new schema({
    diesease: String,
    symptoms:String,
    description:String,
    treatment:String,
});

module.exports = mongoose.model("diagonosis", diagonosisSchema);
