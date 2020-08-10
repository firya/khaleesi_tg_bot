const ngrockUrl = 'https://bd38166c14b1.eu.ngrok.io'; // for local use
export const hostURL = (process.env.NODE_ENV == 'development') ? `${ngrockUrl}` : `https://${process.env.VIRTUAL_HOST}`;