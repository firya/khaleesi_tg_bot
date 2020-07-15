import request from 'request';
import { dateForRoistat, checkIsHasValidDomain } from '../utils.js';

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

  getCallerByPhone = (phone) => {
    return new Promise((resolve, reject) => {
      this.api("POST", 'project/calltracking/call/list', {}, {
        "filters": [
          [
            "caller",
            "=",
            phone
          ]
        ],
        "limit": 1,
        "offset": 0,
        "extend": ["visit"]
      }).then(res => {
        var result = {};
        var site = (res.data[0]) ? res.data[0].comment : null;
        site = checkIsHasValidDomain(site);
        result.site = site;
        result.roistat_id = (res.data[0]) ? res.data[0].visit_id : null;
        result.metrika_id = (res.data[0]?.visit?.metrika_client_id) ? res.data[0].visit.metrika_client_id : null;
        resolve(result);
      })
    });
  }

  addCall = (data) => {
    return new Promise((resolve, reject) => {
      this.api("POST", 'project/phone-call', {},
        {
          "callee": data.callee,
          "caller": data.caller,
          "date": dateForRoistat(),
          "duration": 20,
          "order_id": null,
          "save_to_crm": "0",
          "status": "ANSWER",
          "visit_id": data.roistat,
          "comment": "",
          "answer_duration": 15
        }
      ).then(res => {
        console.log(res)
        resolve();
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
          ...headers
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