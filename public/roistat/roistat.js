import request from "request";
import {
  dateForRoistat,
  timestampToDate,
  checkIsHasValidDomain,
  timeout,
} from "../utils.js";

class Roistat {
  constructor() {
    this.projectId = process.env.ROISTAT_ID;
    this.APIkey = process.env.ROISTAT_KEY;
    this.domain = `https://cloud.roistat.com/api/v1/`;
  }

  getMarketingCost = async (interval) => {
    var data = {
      dimensions: [],
      metrics: ["marketing_cost"],
      period: {
        from: interval.from,
        to: interval.to,
      },
    };

    var yaMarketCost = 0;
    if (interval.to * 1000 > Date.now()) {
      yaMarketCost = await this.getYaMarketAvgCost(interval);
    }

    return new Promise((resolve, reject) => {
      this.api("GET", "project/analytics/data", data).then((res) => {
        if (res.data[0].items.length) {
          resolve(res.data[0].items[0].metrics[0].value + yaMarketCost);
        } else {
          resolve(0);
        }
      });
    });
  };

  getYaMarketAvgCost = (interval) => {
    var daysCount = 7;

    var data = {
      dimensions: ["marker_level_1"],
      metrics: ["marketing_cost"],
      period: {
        from: interval.to - 60 * 60 * 24 * (daysCount + 1),
        to: interval.to - 60 * 60 * 24,
      },
      filters: [
        {
          field: "marker_level_1",
          operation: "=",
          value: "yamarket10",
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.api("GET", "project/analytics/data", data).then((res) => {
        if (res.data[0].items.length) {
          resolve(res.data[0].items[0].metrics[0].value / daysCount);
        } else {
          resolve(0);
        }
      });
    });
  };

  getCallerByPhone = (phone) => {
    return new Promise((resolve, reject) => {
      this.api(
        "POST",
        "project/calltracking/call/list",
        {},
        {
          filters: [["caller", "=", phone]],
          limit: 1,
          offset: 0,
          extend: ["visit"],
        }
      ).then(async (res) => {
        if (res) {
          await timeout(100);
          if (res.status == "error") {
            reject(res.error);
          } else {
            var result = {};
            var site = res.data[0] ? res.data[0].comment : null;

            site = checkIsHasValidDomain(site);
            result.site = site;
            result.roistatId = res.data[0] ? res.data[0].visit_id : null;
            result.metrikaId = res.data[0]?.visit?.metrika_client_id
              ? res.data[0].visit.metrika_client_id
              : null;
            resolve(result);
          }
        } else {
          reject("error");
        }
      });
    });
  };

  addCall = (data) => {
    return new Promise((resolve, reject) => {
      this.api(
        "POST",
        "project/phone-call",
        {},
        {
          callee: data.callee,
          caller: data.caller,
          date: dateForRoistat(),
          duration: 20,
          order_id: null,
          save_to_crm: "0",
          status: "ANSWER",
          visit_id: data.roistat,
          comment: "",
          answer_duration: 15,
        }
      ).then((res) => {
        console.log(res);
        resolve();
      });
    });
  };

  api = async (method, name, query = {}, params = {}, headers = {}) => {
    return new Promise((resolve, reject) => {
      query.type = "json";
      request(
        {
          url: `${this.domain}${name}?key=${this.APIkey}&project=${this.projectId}`,
          qs: query,
          method: method,
          json: params,
          headers: {
            ...headers,
          },
        },
        (err, res, body) => {
          if (err) {
            return reject(err);
          }
          if (res.statusCode != 200) {
            return reject({
              code: res.statusCode,
              message: res.statusMessage,
            });
          }
          resolve(body);
        }
      );
    });
  };
}

export const roistat = new Roistat();
