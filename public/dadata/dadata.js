import DaData from 'dadata';

export const dadata = new DaData(process.env.DADATA_TOKEN, process.env.DADATA_SECRET);

export const dadataAddress = (method, data) => {
  return new Promise((resolve, reject) => {
    dadata(method, data, function (err, res) {
      if (err) {
        reject(err);
      }
      if (res) {
        var result = res.map((item, i) => {
          return (item.qc == 0) ? item.result : data[i];
        });
        resolve(result);
      } else {
        resolve(data);
      }
    });
  });
}

export const dadataPhone = (method, data) => {
  return new Promise((resolve, reject) => {
    dadata(method, data, function (err, res) {
      if (err) {
        reject(err);
      }
      if (res) {
        resolve(res.map((item, i) => {
          return (item.qc == 0) ? item.phone : data[i];
        }));
      } else {
        resolve(data);
      }
    });
  });
}

