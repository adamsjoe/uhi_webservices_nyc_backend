const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let movies = [
  {
    id: "1",
    title: "Zack Synders Justice League",
    dir: "Zack Synder",
    platform: "Google TV",
  },
  {
    id: "2",
    title: "Man of Steel",
    dir: "Zack Synder",
    platform: "Google TV",
  },
  {
    id: "3",
    title: "Batman vs Superman",
    dir: "Zack Synder",
    platform: "Google TV",
  },
  {
    id: "4",
    title: "Wolf of Wall Street",
    dir: "Martin Scorsese",
    platform: "Amazon Prime",
  },
];

app.get("/movie/:title", (req, res) => {
  const movie = movies.find(
    (singleMovie) => singleMovie.title == req.params.title
  );
  res.json(movie);
});

app.get("/movies/", (req, res) => {
  res.json(movies);
});

app.get("/movies/dir/:name", (req, res) => {
  const dirMovies = movies.filter(
    (dirMovie) => dirMovie.dir == req.params.name
  );
  res.json(dirMovies);
});

app.post("/movie", (req, res) => {
  movies.push(req.body);
  res.json("movie added");
});

app.listen(port, () => {
  console.log("Wating for connection...");
});
