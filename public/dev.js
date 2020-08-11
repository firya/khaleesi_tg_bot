const ngrockUrl = 'https://5805dbca6c70.eu.ngrok.io'; // for local use
export const hostURL = (process.env.NODE_ENV == 'development') ? `${ngrockUrl}` : `https://${process.env.VIRTUAL_HOST}`;