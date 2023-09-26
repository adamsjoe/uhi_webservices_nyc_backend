const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

async function returnAggregatedView(source) {
  console.log("Getting colsolated data");

  const query = `
  WITH input_data AS (
  SELECT
    DATE(CAST(year AS INT64), CAST(mo AS INT64), CAST(da AS INT64)) AS collision_date,
    NEIGHBORHOOD AS borough,
    day,
    year,
    mo,
    da,
    temp,
    dewp,
    slp,
    visib,
    wdsp,
    mxpsd,
    gust,
    max,
    min,
    prcp,
    sndp,
    fog,
    CAST(COALESCE(CAST(CYCLISTS_KILLED AS INT64), 0) AS INT64) AS cyclists_killed,
    CAST(COALESCE(CAST(CYCLISTS_INJURED AS INT64), 0) AS INT64) AS cyclists_injured,
    CAST(COALESCE(CAST(MOTORISTS_KILLED AS INT64), 0) AS INT64) AS motorists_killed,
    CAST(COALESCE(CAST(MOTORISTS_INJURED AS INT64), 0) AS INT64) AS motorists_injured,
    CAST(COALESCE(CAST(PEDS_KILLED AS INT64), 0) AS INT64) AS peds_killed,
    CAST(COALESCE(CAST(PEDS_INJURED AS INT64), 0) AS INT64) AS peds_injured,
    CAST(COALESCE(CAST(PERSONS_KILLED AS INT64), 0) AS INT64) AS persons_killed,
    CAST(COALESCE(CAST(PERSONS_INJURED AS INT64), 0) AS INT64) AS persons_injured,
    CAST(COALESCE(CAST(NUM_COLLISIONS AS INT64), 0) AS INT64) AS num_collisions
  FROM \`uhi-assignment-1.assignment.${source}\`
  WHERE
    NEIGHBORHOOD != "Unknown"
),

aggregated_data AS (
  SELECT
    collision_date,
    borough,
    day,
    year,
    mo,
    da,
    AVG(temp) AS temp,
    AVG(dewp) AS dewp,
    AVG(slp) AS slp,
    AVG(visib) AS visib,
    AVG(wdsp) AS wdsp,
    AVG(mxpsd) AS mxpsd,
    AVG(gust) AS gust,
    MAX(max) AS max,
    MIN(min) AS min,
    SUM(prcp) AS prcp,
    MAX(sndp) AS sndp,
    MAX(fog) AS fog,
    SUM(cyclists_killed) AS cyclists_killed,
    SUM(cyclists_injured) AS cyclists_injured,
    SUM(motorists_killed) AS motorists_killed,
    SUM(motorists_injured) AS motorists_injured,
    SUM(peds_killed) AS peds_killed,
    SUM(peds_injured) AS peds_injured,
    SUM(persons_killed) AS persons_killed,
    SUM(persons_injured) AS persons_injured,
    SUM(num_collisions) AS num_collisions
  FROM
    input_data
  GROUP BY
    collision_date,
    borough,
    day,
    year,
    mo,
    da
)

SELECT
  FORMAT_TIMESTAMP("%Y-%m-%dT%H:%M:%E3fZ", collision_date) AS DATE,
  borough AS BOROUGH,
  EXTRACT(DAYOFWEEK FROM collision_date) AS WEEKDAY,
  year AS YEAR,
  mo AS MONTH,
  da AS DAY,
  FORMAT_TIMESTAMP("%Y-%m-%dT%H:%M:%E3fZ", collision_date) AS COLLISION_DATE,
  temp,
  dewp,
  slp,
  visib,
  wdsp,
  mxpsd,
  gust,
  max,
  min,
  prcp,
  sndp,
  fog,
  cyclists_killed,
  cyclists_injured,
  motorists_killed,
  motorists_injured,
  peds_killed,
  peds_injured,
  persons_killed,
  persons_injured,
  num_collisions
FROM
  aggregated_data
ORDER BY
  collision_date,
  borough
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
  console.log(`-->Will this work?`);
  return [rows];
}
module.exports = { returnAggregatedView };
