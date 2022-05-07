const Genre = require("../models/Genre");
const Book = require("../models/Book");

const genresMock = require("../mock/genres.json");
const booksMock = require("../mock/books.json");
const chalk = require("chalk");

module.exports = async () => {
  const books = await Book.find();
  if (books.length !== booksMock.length) {
    await createInitialEntity(Book, booksMock);
  }

  const genres = await Genre.find();
  if (genres.length !== genresMock.length) {
    await createInitialEntity(Genre, genresMock);
  }
};

async function createInitialEntity(Model, mockData) {
  await Model.collection.drop();
  return Promise.all(
    mockData.map(async (item) => {
      try {
        delete item._id;
        const newItem = new Model(item);
        await newItem.save();
        return newItem;
      } catch (e) {
        return e;
      }
    })
  );
}
