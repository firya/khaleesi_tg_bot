const ngrockUrl = 'https://c6fad62fe3dc.eu.ngrok.io'; // for local use
export const hostURL = (process.env.NODE_ENV == 'development') ? `${ngrockUrl}` : `https://${process.env.VIRTUAL_HOST}`;