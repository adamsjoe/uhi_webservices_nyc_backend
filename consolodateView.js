const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

async function consolodateViews(tableName, weatherView) {
  console.log("Creating final conslodated table");

  const query = `
  CREATE TABLE \`uhi-assignment-1.assignment.x4-collated_data\` AS
  SELECT
    DATE,
    BOROUGH,
    WEEKDAY,
    YEAR,
    MONTH,
    DAY,
    COLLISION_DATE,
    TEMP,
    DEWP,
    SLP,
    VISIB,
    WDSP,
    MXPSD,
    GUST,
    MAX,
    MIN,
    PRCP,
    SNDP,
    FOG,
    CYCLISTS_KILLED,
    CYCLISTS_INJURED,
    MOTORISTS_KILLED,
    MOTORISTS_INJURED,
    PEDS_KILLED,
    PEDS_INJURED,
    PERSONS_KILLED,
    PERSONS_INJURED,
    NUM_COLLISIONS
  FROM
    \`uhi-assignment-1.assignment.${weatherView}\` AS weather,
    \`uhi-assignment-1.assignment.${tableName}\` AS complaints
  WHERE
    complaints.collision_date = weather.date
`;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    //   // Location must match that of the dataset(s) referenced in the query.
    location: "US",
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`-->Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  console.log(`-->Collated table created successfully.`);

  return [rows];
}
module.exports = { consolodateViews };
