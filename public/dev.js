const ngrockUrl = "https://072290710956.eu.ngrok.io"; // for local use
export const hostURL =
  process.env.NODE_ENV == "development"
    ? `${ngrockUrl}`
    : `https://${process.env.VIRTUAL_HOST}`;
