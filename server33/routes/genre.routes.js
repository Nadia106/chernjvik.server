const express = require("express");
const Genre = require("../models/Genre");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/roleMiddleware");
const router = express.Router({ mergeParams: true });

router.route("/").get(auth, async (req, res) => {
  try {
    const list = await Genre.find();
    res.status(200).send(list);
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже."
    });
  }
});
router.post(role(["ADMIN"]), async (req, res) => {
  try {
    const newGenre = await Genre.create({
      ...req.body
    });
    res.status(201).send(newGenre);
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка, попробуйте позже."
    });
  }
});

router.delete("/:genreId", role(["ADMIN"]), async (req, res) => {
  try {
    const { genreId } = req.params;
    const removedGenre = await Genre.findById(genreId);

    if (removedGenre.genreId.toString() === req.genre._id) {
      await removedGenre.remove();
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
