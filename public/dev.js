const ngrockUrl = "https://2770f032cb85.eu.ngrok.io"; // for local use
export const hostURL =
  process.env.NODE_ENV == "development"
    ? `${ngrockUrl}`
    : `https://${process.env.VIRTUAL_HOST}`;
