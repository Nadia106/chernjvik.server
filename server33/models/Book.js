const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    genres: [
      {
        type: Schema.Types.ObjectId,
        ref: "Genre",
        required: true
      }
    ],
    img: {
      type: String,
      required: true
    },
    rate: {
      type: Number
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    yearOfPublishing: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = model("Book", schema);
