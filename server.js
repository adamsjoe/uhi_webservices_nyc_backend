const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const { createWeatherView } = require("./createWeatherView");
const {
  createInitialCollisionsView,
} = require("./createInitialCollisionsView");
const { handleMissingBorough } = require("./handleMissingBoroughs");

const { createViewWithDayField } = require("./createWithDay");
const { consolodateViews } = require("./consolodateView");

// setup the service account to access google
const service_key = "./service-key.json";
process.env.GOOGLE_APPLICATION_CREDENTIALS = service_key;

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
    console.log("In the all data query");
    const allAccidentData = await accidentDataModel.find();
    res.json(allAccidentData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/getMinDate:
 *   get:
 *     summary: Retrieves the earliest record in the database.
 *     description: Retrieves the earliest record in the database.
 *     tags:
 *       - Historic
 */
app.get("/historic/getMinDate", async (req, res) => {
  try {
    console.log("In the find earliest record query");
    const allAccidentData = await accidentDataModel
      .findOne()
      .sort({ DATE: 1 })
      .lean()
      .exec();
    const datePart = allAccidentData.DATE.toISOString().split("T")[0];
    res.json(datePart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/getMaxDate:
 *   get:
 *     summary: Retrieves the latest record in the database.
 *     description: Retrieves the earliest record in the database.
 *     tags:
 *       - Historic
 */
app.get("/historic/getMaxDate", async (req, res) => {
  try {
    console.log("In the find latest record query");
    const allAccidentData = await accidentDataModel
      .findOne()
      .sort({ DATE: -1 })
      .lean()
      .exec();
    const datePart = allAccidentData.DATE.toISOString().split("T")[0];
    res.json(datePart);
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
    console.log(`In the historic query to get all boroughs`);
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
  console.log(`In the historic query to get all data for ${req.params.name}`);
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

    summaryArray.sort((a, b) => {
      // Compare years first
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      // If years are the same, compare months
      return a.month - b.month;
    });

    res.json(summaryArray);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /historic/borough/:name/getActiveYears:
 *   get:
 *     summary: Retrieves a list of distinct years for the given borough
 *     tags:
 *       - Historic
 */
// had to defind this before due to how express matches routes, once it its a match it stops!!
app.get("/historic/borough/:name/activeYears", async (req, res) => {
  console.log(`in active years for ${req.params.name}`);
  try {
    const boroughData = await accidentDataModel
      .find({
        BOROUGH: req.params.name,
      })
      .distinct("YEAR");
    res.json(boroughData);
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
  console.log(`in query for ${req.params.name} for ${req.params.year}`);
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
  console.log(
    `in query for ${req.params.name} for ${req.params.year} - SUMMAARY`
  );

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
      YEAR: req.params.year,
    });

    boroughData.forEach((item) => {
      const year = item.YEAR;
      const month = item.MONTH;
      const key = `${year}=${month}`;

      console.log(`year ${year}`);
      console.log(`month ${month}`);
      console.log(`key ${key}`);

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

    summaryArray.sort((a, b) => a.month - b.month);

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
  console.log(
    `in query for ${req.params.name} for ${req.params.year} and ${req.params.month}`
  );
  try {
    const boroughData = await accidentDataModel
      .find({
        BOROUGH: req.params.name,
        YEAR: req.params.year,
        MONTH: req.params.month,
      })
      .sort({ DAY: 1 });

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
  console.log(
    `in query for ${req.params.name} for ${req.params.year} and ${req.params.month} and ${req.params.day}`
  );
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

app.get("/liveData/borough/:name/:year/:month", async (req, res) => {
  console.log("in live query");

  const BOROUGH = req.params.name;
  const YEAR = req.params.year;
  const MONTH = req.params.month;

  // Call with the temp table name - we will delete this later
  const tempWeatherView = `x1-tempWeatherFor-${YEAR}`;
  await createWeatherView(YEAR, tempWeatherView);

  // create a temp view for initial collisions
  const nameForTempInitialCollisionsView = `x2-initial_colison_data_${BOROUGH}-${MONTH}-${YEAR}`;
  await createInitialCollisionsView(
    nameForTempInitialCollisionsView,
    BOROUGH,
    YEAR,
    MONTH
  );

  // now handle the missing boroughs, need to ensure our data is as spot on as possible
  await handleMissingBorough(nameForTempInitialCollisionsView);

  // // now we need to add in a day (well we don't but if we accomplish
  // // stretch goals it will be needed, so may as well do it here)
  const nameForViewWithDay = `x3-${BOROUGH}-${MONTH}-${YEAR}-final`;
  await createViewWithDayField(
    nameForViewWithDay,
    nameForTempInitialCollisionsView
  );

  const results = await consolodateViews(nameForViewWithDay, tempWeatherView);
  // res.json(results);
});

app.listen(port, () => {
  console.log("Wating for connection...");
});

// note for me.
// something isn't quite working right, take a break and come back
