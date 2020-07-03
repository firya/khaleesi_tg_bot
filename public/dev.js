const ngrockUrl = 'https://99779b813165.eu.ngrok.io'; // for local use
export const hostURL = (process.env.NODE_ENV == 'development') ? `${ngrockUrl}` : `https://${process.env.VIRTUAL_HOST}`;