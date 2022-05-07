const express = require("express");
const Book = require("../models/Book");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/roleMiddleware");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(async (req, res) => {
    try {
      const list = await Book.find();
      res.status(200).send(list);
    } catch (e) {
      res.status(500).json({
        message: "На сервере произошла ошибка, попробуйте позже."
      });
    }
  })

  .post(role(["ADMIN"]), async (req, res) => {
    try {
      const newBook = await Book.create({
        ...req.body
        // genres: [req.genre._id]
      });
      res.status(201).send(newBook);
    } catch (e) {
      res.status(500).json({
        message: "На сервере произошла ошибка, попробуйте позже."
      });
    }
  });

router.patch("/:bookId", role(["ADMIN"]), async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId, req.body);
    req.send(book);
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже."
    });
  }
});

router.delete("/:bookId", role(["ADMIN"]), async (req, res) => {
  try {
    const { bookId } = req.params;
    const removedBook = await Book.findById(bookId);

    if (removedBook.bookId.toString() === req.book._id) {
      await removedBook.remove();
      return res.send(null);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже."
    });
  }
});
module.exports = router;
