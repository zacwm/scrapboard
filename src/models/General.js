const mongoose = require("mongoose");
const { Schema } = mongoose;

const generalSchema = new Schema({
  bannerURI: {
    type: Schema.Types.String,
  }
});

module.exports = mongoose.model("Generals", generalSchema);