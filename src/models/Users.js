const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  token: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  discordID: {
    type: Schema.Types.String,
    required: true,
  },
  discordAccess: {
    type: Schema.Types.String,
    required: true,
  },
  discordRefresh: {
    type: Schema.Types.String,
    required: true,
  },
  banned: {
    type: Schema.Types.Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Users", userSchema);