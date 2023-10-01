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
    CAST(mo AS INT64) AS mo,
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
    AVG(temp) AS TEMP,
    AVG(dewp) AS DEWP,
    AVG(slp) AS SLP,
    AVG(visib) AS VISIB,
    AVG(wdsp) AS WDSP,
    AVG(mxpsd) AS MXPSD,
    AVG(gust) AS GUST,
    MAX(max) AS MAX,
    MIN(min) AS MIN,
    SUM(prcp) AS PRCP,
    MAX(sndp) AS SNDP,
    MAX(fog) AS FOG,
    SUM(cyclists_killed) AS CYC_KILL,
    SUM(cyclists_injured) AS CYC_INJD,
    SUM(motorists_killed) AS MOTO_KILL,
    SUM(motorists_injured) AS MOTO_INJD,
    SUM(peds_killed) AS PEDS_KILL,
    SUM(peds_injured) AS PEDS_INJD,
    SUM(persons_killed) AS PERS_KILL,
    SUM(persons_injured) AS PERS_INJD,
    SUM(num_collisions) AS NUM_COLS
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
  CYC_KILL,
  CYC_INJD,
  MOTO_KILL,
  MOTO_INJD,
  PEDS_KILL,
  PEDS_INJD,
  PERS_KILL,
  PERS_INJD,
  NUM_COLS
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
