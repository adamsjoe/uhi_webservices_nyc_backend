const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "New York Accident visualiser API",
    version: "1.0.0",
  },
};

const options = {
  swaggerDefinition,
  apis: ["./*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

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

/**
 * @swagger
 * /historic/all:
 *   get:
 *     summary: Retrieves all the data in the database.
 *     description: Retrieves all the data, for all boroughs and years.  Not useful for real application, used mainly to test calls are working.
 *     tags:
 *       - Historic
 */
app.get("/historic/all", async (req, res) => {
  try {
    const allAccidentData = await accidentDataModel.find();
    res.json(allAccidentData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/boroughs:
 *   get:
 *     summary: Retrieves an array of boroughs in the database.
 *     description: Returns an array of all unique Boroughs in the database.
 *     tags:
 *       - Historic
 *     responses:
 *       200:
 *         description: A list of boroughs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: A borough.
 *                         example: BRONX
 */
app.get("/historic/boroughs", async (req, res) => {
  try {
    const allBoroughs = await accidentDataModel.find().distinct("BOROUGH");

    res.json(allBoroughs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/borough/{name}:
 *   get:
 *     summary: Retrieves all data for a given borough
 *     description: Returns an array of of objects of all the data (over all years) for a given borough.
 *     tags:
 *       - Historic
 */
app.get("/historic/borough/:name", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/borough/:name/summary:
 *   get:
 *     summary: Retrieves a summary of the data for a given borough
 *     description: Returns a summary of the data for the borough.
 *     tags:
 *       - Historic
 */
app.get("/historic/borough/:name/summary", async (req, res) => {
  console.log("in summary for " + req.params.name);
  class BoroughSummary {
    constructor(
      year,
      month,
      CYC_KILL,
      CYC_INJD,
      MOTO_KILL,
      MOTO_INJD,
      PEDS_KILL,
      PEDS_INJD,
      PERS_KILL,
      PERS_INJD,
      NUM_COLS
    ) {
      this.year = year;
      this.month = month;
      this.CYC_KILL = CYC_KILL;
      this.CYC_INJD = CYC_INJD;
      this.MOTO_KILL = MOTO_KILL;
      this.MOTO_INJD = MOTO_INJD;
      this.PEDS_KILL = PEDS_KILL;
      this.PEDS_INJD = PEDS_INJD;
      this.PERS_KILL = PERS_KILL;
      this.PERS_INJD = PERS_INJD;
      this.NUM_COLS = NUM_COLS;
    }
  }

  const summaries = {};
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
    });

    boroughData.forEach((item) => {
      const year = item.YEAR;
      const month = item.MONTH;
      const key = `${year}=${month}`;

      if (!summaries[key]) {
        summaries[key] = new BoroughSummary(
          year,
          month,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ); // Initialize with zeros
      }

      // Aggregate the values
      summaries[key].CYC_KILL += item.CYC_KILL;
      summaries[key].CYC_INJD += item.CYC_INJD;
      summaries[key].MOTO_KILL += item.MOTO_KILL;
      summaries[key].MOTO_INJD += item.MOTO_INJD;
      summaries[key].PEDS_KILL += item.PEDS_KILL;
      summaries[key].PEDS_INJD += item.PEDS_INJD;
      summaries[key].PERS_KILL += item.PERS_KILL;
      summaries[key].PERS_INJD += item.PERS_INJD;
      summaries[key].NUM_COLS += item.NUM_COLS;
    });

    const summaryArray = Object.values(summaries);

    res.json(summaryArray);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/borough/:name/:year:
 *   get:
 *     summary: Retrieves the data for a given borough and year
 *     description: Returns the data for the borough and year.
 *     tags:
 *       - Historic
 */
app.get("/historic/borough/:name/:year", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/borough/:name/:year/summary:
 *   get:
 *     summary: Retrieves a summary of the data for the given borough and year.
 *     description: Returns a summary of the data for the given borough and year.
 *     tags:
 *       - Historic
 */
app.get("/historic/borough/:name/:year/summary", async (req, res) => {
  class BoroughSummary {
    constructor(
      month,
      CYC_KILL,
      CYC_INJD,
      MOTO_KILL,
      MOTO_INJD,
      PEDS_KILL,
      PEDS_INJD,
      PERS_KILL,
      PERS_INJD,
      NUM_COLS
    ) {
      this.month = month;
      this.CYC_KILL = CYC_KILL;
      this.CYC_INJD = CYC_INJD;
      this.MOTO_KILL = MOTO_KILL;
      this.MOTO_INJD = MOTO_INJD;
      this.PEDS_KILL = PEDS_KILL;
      this.PEDS_INJD = PEDS_INJD;
      this.PERS_KILL = PERS_KILL;
      this.PERS_INJD = PERS_INJD;
      this.NUM_COLS = NUM_COLS;
    }
  }

  const summaries = {};

  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
    });

    boroughData.forEach((item) => {
      const month = item.MONTH;
      if (!summaries[month]) {
        summaries[month] = new BoroughSummary(month, 0, 0, 0, 0, 0, 0, 0, 0, 0); // Initialize with zeros
      }

      // Aggregate the values
      summaries[month].CYC_KILL += item.CYC_KILL;
      summaries[month].CYC_INJD += item.CYC_INJD;
      summaries[month].MOTO_KILL += item.MOTO_KILL;
      summaries[month].MOTO_INJD += item.MOTO_INJD;
      summaries[month].PEDS_KILL += item.PEDS_KILL;
      summaries[month].PEDS_INJD += item.PEDS_INJD;
      summaries[month].PERS_KILL += item.PERS_KILL;
      summaries[month].PERS_INJD += item.PERS_INJD;
      summaries[month].NUM_COLS += item.NUM_COLS;
    });

    const summaryArray = Object.values(summaries);

    res.json(summaryArray);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/borough/:name/:year/:month:
 *   get:
 *     summary: Retrieves the data for the given borough, year and month.
 *     description: Retrieves the data for the given borough, year and month.
 *     tags:
 *       - Historic
 */
app.get("/historic/borough/:name/:year/:month", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
      MONTH: req.params.month,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/borough/:name/:year/:month/:day:
 *   get:
 *     summary: Retrieves the data for the given borough, year, month and day.
 *     description: Retrieves the data for the given borough, year, month and day.
 *     tags:
 *       - Historic
 */
app.get("/historic/borough/:name/:year/:month/:day", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
      MONTH: req.params.month,
      DAY: req.params.day,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log("Wating for connection...");
});
