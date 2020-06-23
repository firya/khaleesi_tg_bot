import request from 'request';

class Roistat {
  constructor() {
    this.projectId = process.env.ROISTAT_ID;
    this.APIkey = process.env.ROISTAT_KEY;
    this.domain = `https://cloud.roistat.com/api/v1/`;
  }

  getMarketingCost = (interval) => {
    var data = {
      dimensions: [],
      metrics: [
        "marketing_cost",
      ],
      period: {
        from: interval.from,
        to: interval.to
      }
    };

    return new Promise((resolve, reject) => {
      this.api("GET", 'project/analytics/data', data).then(res => {
        if (res.data[0].items.length) {
          resolve(res.data[0].items[0].metrics[0].value);
        } else {
          resolve(0);
        }
      })
    });
  }

  api = async (method, name, query = {}, params = {}, headers = {}) => {
    return new Promise((resolve, reject) => {
      query.type = 'json';
      request({
        url: `${this.domain}${name}?key=${this.APIkey}&project=${this.projectId}`,
        qs: query,
        method: method,
        json: params,
        headers: {
          ...headers,
          'Cookie': this.cookies
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

export const roistat = new Roistat();