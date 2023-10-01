const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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

// const accidentDataModel = require("./models/accidentDataModel");
require("./routes/historicData/testRoute")(app);
require("./routes/historicData/historicData")(app);
require("./routes/liveData/liveData")(app);

app.listen(port, () => {
  console.log("Wating for connection...");
});
