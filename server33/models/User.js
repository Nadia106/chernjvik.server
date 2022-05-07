const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{type: String, ref: "Role"}],
    phoneNumber: { type: Number },
    sex: {
      type: String,
      enum: ["male", "female"]
    },
    image: String
  },
  {
    timestamps: true
  }
);

module.exports = model("User", schema);
