const ngrockUrl = "https://d484566ce185.eu.ngrok.io"; // for local use
export const hostURL =
  process.env.NODE_ENV == "development"
    ? `${ngrockUrl}`
    : `https://${process.env.VIRTUAL_HOST}`;
