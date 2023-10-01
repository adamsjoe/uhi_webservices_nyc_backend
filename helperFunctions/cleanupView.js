const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

async function cleanupView(view) {
  console.log("Cleaning up temp view called - ", view);

  const query = `DROP VIEW ${view}`;

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
  console.log(`--> Dropped view ${view}`);
}
module.exports = { cleanupView };
