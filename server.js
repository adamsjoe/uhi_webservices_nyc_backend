const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// const swaggerJSDoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");

// setup the service account to access google
// const service_key = "./service-key.json";
// process.env.GOOGLE_APPLICATION_CREDENTIALS = service_key;

// const swaggerDefinition = {
//   openapi: "3.0.0",
//   info: {
//     title: "New York Accident visualiser API",
//     version: "1.0.0",
//   },
// };

// const options = {
//   swaggerDefinition,
//   apis: ["./*.js"],
// };

// const swaggerSpec = swaggerJSDoc(options);

const app = express();
const port = process.env.port || 8080;

// const corsOption = {
//   origin: [
//     "http://localhost:3000",
//     "http://nycfrontend-19000170.azurewebsites.net/",
//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
// };

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use(corsOption);

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
require("./routes/historicData/testRoute")(app);
require("./routes/historicData/historicData")(app);
require("./routes/liveData/liveData")(app);

app.listen(port, () => {
  console.log("Waiting for connection...");
});

app.get("/hello", async (req, res) => {
  console.log("Saying hello.");
  res.status(200).json({ message: "Hello There." });
});
