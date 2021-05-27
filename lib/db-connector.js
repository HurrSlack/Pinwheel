const camelspace = require("camelspace");

function createDbConnector({ connectorType }) {
  if (!connectorType) {
    throw new Error(
      "Must provide a DB_CONNECTOR_TYPE env var to point to a supported database connector."
    );
  }
  let DBConnector;
  try {
    DBConnector = require(`./db-connectors/connector-${connectorType}`);
  } catch (e) {
    throw new Error(
      `Could not load a database connector of type "${connectorType}". ${e.message}`
    );
  }
  const connectorConfig = camelspace(connectorType).fromEnv(process.env);
  return new DBConnector(connectorConfig);
}

module.exports = createDbConnector;
