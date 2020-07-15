import request from 'request';
import createCsvWriter from 'csv-writer';
import fs from 'fs';
import { timestampToDate } from '../utils.js';

class Metrika {
  constructor() {
    this.url = 'https://api-metrika.yandex.net';
    this.token = process.env.METRIKA_TOKEN;
    this.version = 1;
    this.pathToCSV = 'static/metrika'
  }

  postCSVData = (counterId, headers, data) => {
    return new Promise((resolve, reject) => {
      var currentTime = Math.round(new Date().getTime() / 1000);

      var fileName = `${timestampToDate(currentTime, false, true)}.csv`;

      const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: `${this.pathToCSV}/${fileName}`,
        header: headers.map(header => { return { id: header.toLowerCase(), title: header } })
      });

      var csvData = [];
      data.map((row, i) => {
        var csvRow = {};
        row.map((cell, j) => {
          csvRow[headers[j].toLowerCase()] = cell;
        });
        csvData.push(csvRow);
      });

      csvWriter.writeRecords(csvData).then(() => {
        const formData = {
          file: [
            fs.createReadStream(`./${this.pathToCSV}/${fileName}`)
          ]
        };

        this.api('POST', counterId, 'offline_conversions/upload?client_id_type=CLIENT_ID', formData)
          .then(res => console.log(res))
          .catch(err => console.log(err));
      });
    });
  }

  api = async (method, counterId, name, formData, headers = {}) => {
    return new Promise((resolve, reject) => {
      request({
        url: `${this.url}/management/v${this.version}/counter/${counterId}/${name}`,
        method: method,
        formData: formData,
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
          "Authorization": `OAuth ${this.token}`
        }
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }
        if (res.statusCode != 200) {
          return reject({
            code: res.statusCode,
            message: res.statusMessage
          });
        }
        resolve(body);
      });
    });
  }
}

export const metrika = new Metrika();