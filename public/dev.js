const ngrockUrl = "https://aafb896d9f6b.eu.ngrok.io"; // for local use
export const hostURL =
  process.env.NODE_ENV == "development"
    ? `${ngrockUrl}`
    : `https://${process.env.VIRTUAL_HOST}`;
