const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  status: {
    type: Schema.Types.String,
    required: true,
  },
  unix: {
    type: Schema.Types.Number,
    required: true,
  },
  name: {
    type: Schema.Types.String,
    required: true,
  },

  // Canvas object data.
  uri: {
    type: Schema.Types.String,
    required: true,
  },
  angle: {
    type: Schema.Types.Number,
    required: true,
  },
  scaleX: {
    type: Schema.Types.Number,
    required: true,
  },
  scaleY: {
    type: Schema.Types.Number,
    required: true,
  },
  top: {
    type: Schema.Types.Number,
    required: true,
  },
  left: {
    type: Schema.Types.Number,
    required: true,
  },
});

module.exports = mongoose.model("Submissions", submissionSchema);