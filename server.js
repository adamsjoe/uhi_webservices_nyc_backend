const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(
  "mongodb+srv://testDBUser:gd5R7PJ75MJXqrXN@webervice.yhwacfo.mongodb.net/AccidentData?retryWrites=true&w=majority"
);
const connection = mongoose.connection;

connection.on("error", () => {
  console.error.bind(console, "error");
});

connection.once("open", () => {
  console.log("Mongoose Connected");
});

const accidentDataModel = require("./models/accidentDataModel");

app.get("/getAllData/", async (req, res) => {
  try {
    const allAccidentData = await accidentDataModel.find();
    res.json(allAccidentData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// app.get("/movie/:title", (req, res) => {
//   // const movie = movies.find(
//   //   (singleMovie) => singleMovie.title == req.params.title
//   // );
//   // res.json(movie);
// });

// app.get("/movies/", (req, res) => {
//   // res.json(movies);
// });

// app.get("/movies/dir/:name", (req, res) => {
//   // const dirMovies = movies.filter(
//   //   (dirMovie) => dirMovie.dir == req.params.name
//   // );
//   // res.json(dirMovies);
// });

// app.post("/movie", (req, res) => {
//   // movies.push(req.body);
//   // res.json("movie added");
// });

app.listen(port, () => {
  console.log("Wating for connection...");
});
