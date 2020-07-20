import request from 'request';
import { store } from '../store.js';
import { roistat } from '../roistat/roistat.js';
import { clearPhone } from '../utils.js';

class AmoCRM {
  constructor() {
    this.user = process.env.AMOCRM_USER;
    this.APIkey = process.env.AMOCRM_KEY;
    this.domain = `https://${process.env.AMOCRM_DOMAIN}`;
    this.authorized = false;
    this.cookies = null;
    this.statuses = [];
    this.userList = {};
    this.initialized = false;

    this.getFunctions = {
      events: {
        limit: 100,
        method: '/api/v4/events'
      },
      leads: {
        limit: 250,
        method: '/api/v4/leads'
      },
      contacts: {
        limit: 250,
        method: '/api/v4/contacts'
      },
      leadsHack: {
        limit: 50,
        method: '/ajax/leads/list'
      }
    }
  }

  init = () => {
    return new Promise(async (resolve, reject) => {
      await this.getStatuses();
      await this.getUserList();
      this.initialized = true;
      resolve()
    });
  }

  deAuth = () => {
    this.authorized = false;
    this.cookies = null;
    console.log('AmoCRM authorization cookie expired');
  }

  auth = () => {
    return new Promise((resolve, reject) => {
      request({
        url: this.domain + '/private/api/auth.php',
        qs: {
          type: 'json'
        },
        method: 'POST',
        json: {
          USER_LOGIN: this.user,
          USER_HASH: this.APIkey
        }
      }, (err, res, body) => {
        if (err) {
          return reject(err);
        }
        if (res.statusCode != 200) {
          return reject({
            error_code: res.statusCode,
            error_message: res.statusMessage
          });
        }
        if (body.response.auth === true) {
          this.cookies = res.headers['set-cookie'];
          this.authorized = true;
          this.authCountdown();
          console.log('AmoCRM authorization success');
        }
        resolve(body.response);
      });
    })
  }

  authCountdown = () => {
    setTimeout(this.deAuth, 60 * 10 * 1000);
  }

  api = async (method, name, query = {}, params = {}, headers = {}, force = false) => {
    if (!this.authorized) {
      await this.auth();
    }
    if (!this.initialized && !force) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (this.authorized === false) {
        throw 'Not authorized';
      }
      query.type = 'json';
      request({
        url: this.domain + name,
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
        if (res.statusCode != 200 && res.statusCode != 201) {
          return reject({
            code: res.statusCode,
            message: res.statusMessage
          });
        }
        resolve(body);
      });
    });
  }

  //remove when API out of alpha
  getLeadByMeterDateHack = async (interval) => {
    if (!this.initialized) {
      await this.init();
    }

    var params = {
      filter: {
        status_id: this.statuses.map(status => status.id),
        cf: {
          556365: {
            from: interval.from,
            to: interval.to
          }
        }
      },
      useFilter: 'y'
    };

    return new Promise((resolve, reject) => {
      this.getAllEntities('leadsHack', params, 0, [], {
        'X-Requested-With': 'XMLHttpRequest'
      }).then(res => resolve(res));
    });
  }

  getUserData = (id, params = {}) => {
    return new Promise((resolve, reject) => {
      if (this.userList[id]) {
        resolve(this.userList[id])
      } else {
        this.api('GET', `/api/v4/users/${id}`, params).then((res) => {
          this.userList[id] = res;
          resolve(res);
        }).catch(err => console.log(`Не удалось получить пользователя. Error code: ${err.code}`));
      }
    });
  }

  //api method dont work
  getUserList = () => {
    return new Promise((resolve, reject) => {
      this.userList = {
        136396: {
          name: 'Иван Сергеевич'
        },
        3342907: {
          name: 'Ирина Петровна'
        },
        3342922: {
          name: 'Надежда Викторовна'
        },
        3342934: {
          name: 'Татьяна Юрьевна'
        },
        3342958: {
          name: 'Светлана Леонидовна'
        },
        3349849: {
          name: 'Ирина Николаевна'
        },
        3395416: {
          name: 'Наталья Юрьевна'
        }
      };
      resolve();
      // this.api('GET', `/api/v4/users`).then((res) => {
      //   // this.userList = res['_embedded'].users;
      //   console.log(res)
      // }).catch(err => console.log(`Не удалось получить список пользователей. Error code: ${err.code}`));
    });
  }

  getStatuses = () => {
    return new Promise((resolve, reject) => {
      this.api('GET', `/api/v4/leads/pipelines/1645597/statuses`, {}, {}, {}, true).then((res) => {
        this.statuses = res['_embedded'].statuses;
        resolve();
      }).catch(err => console.log(`Не удалось получить статусы. Error code: ${err.code}`));
    });
  }

  setWebhook = (url, settings) => {
    return new Promise((resolve, reject) => {
      this.api('POST', `/api/v4/webhooks`, {}, {
        destination: url,
        settings: settings
      }).then((res) => {
        resolve();
      }).catch(err => console.log(`Не удалось создать вебхук. Error code: ${err.code}`));
    });
  }

  findStatus = (id) => {
    for (let i = 0; i < this.statuses.length; i++) {
      if (this.statuses[i].id == id) {
        return this.statuses[i];
      }
    }
  }
  // doesnt work
  updateEntities = (entity, data) => {
    return new Promise((resolve, reject) => {
      this.api('POST', `/api/v4/${entity}`, {}, data).then((res) => {
        resolve(res);
      }).catch(err => { console.log(err); console.log(`Не удалось обновить сделку. Error code: ${err.code}`) });
    });
  }

  updateEntity = (entity, id, data) => {
    return new Promise((resolve, reject) => {
      this.api('PATCH', `/api/v4/${entity}/${id}`, {}, data).then((res) => {
        resolve(res);
      }).catch(err => { console.log(err); console.log(`Не удалось обновить сделку. Error code: ${err.code}`) });
    });
  }

  addNote = (entity, id, note) => {
    return new Promise((resolve, reject) => {
      this.api('POST', `/api/v4/${entity}/${id}/notes`, {}, [{
        "note_type": "common",
        "params": {
          "text": note
        }
      }]).then((res) => {
        resolve(res);
      }).catch(err => { console.log(err); console.log(`Не удалось создать заметку. Error code: ${err.code}`) });
    });
  }

  getAllEntities = (entity, params = {}, count = 0, allData = [], headers = {}) => {
    params.limit = (!count || count - allData.length > this.getFunctions[entity].limit) ? this.getFunctions[entity].limit : count - allData.length;

    params.page = (params.page) ? params.page : 1;
    console.log(`${entity}, Page: ${params.page}`);

    var newParams = JSON.parse(JSON.stringify(params));

    if (!count && params.filter?.id?.length && params.filter.id.length > this.getFunctions[entity].limit) {
      var start = (newParams.page - 1) * this.getFunctions[entity].limit;
      var finish = newParams.page * this.getFunctions[entity].limit;

      newParams.filter.id = newParams.filter.id.slice(start, finish);
      newParams.page = 1;
    }

    return new Promise((resolve, reject) => {
      this.api('GET', this.getFunctions[entity].method, newParams, {}, headers).then((res) => {
        var result = (entity != 'leadsHack') ? res['_embedded'][entity] : res.response.items;
        allData = allData.concat(result);

        if ((!count || allData.length < count) && ((result.length == params.limit) || (newParams.filter && newParams.filter.id && newParams.filter.id.length == params.limit))) {
          params.page = params.page + 1;
          resolve(this.getAllEntities(entity, params, count, allData, headers));
        } else {
          resolve(allData);
        }
      }).catch(err => { console.log(`get ${entity}, ${params.filter.id}. Error code: ${err.code}`); resolve(allData); });
    });
  }

  findFieldValueById = (fields, id, array = false, modifier = value => value) => {
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].field_id == id) {
          return (!array) ? modifier(fields[i].values[0].value) : fields[i].values.map(value => modifier(value.value));
        }
      }

    } else {
      return [];
    }
  }

  // interval or id
  updateTrackingParams = async (data = {}) => {
    var filter = (data.interval) ? { created_at: data.interval } : { id: data.id }

    var leads = await amocrm.getAllEntities('leads', {
      filter: filter,
      with: 'contacts'
    });

    leads = await amocrm.getLeadsContacts(leads);

    for (const lead of leads) {
      var roistatId = this.findFieldValueById(lead.custom_fields_values, store.fieldIds.lead.roistat);
      var metrikaId = this.findFieldValueById(lead.custom_fields_values, store.fieldIds.lead.metrikaId);
      var site = amocrm.findFieldValueById(lead.custom_fields_values, store.fieldIds.lead.site);

      if (!roistatId || !metrikaId || !site) {
        var result = await this.getTrackingParams(lead);

        this.updateEntity('leads', lead.id, {
          custom_fields_values: [
            {
              field_id: store.fieldIds.lead.site,
              values: [
                {
                  value: result.site || null
                }
              ]
            }, {
              field_id: store.fieldIds.lead.roistat,
              values: [
                {
                  value: result.roistatId || null
                }
              ]
            }, {
              field_id: store.fieldIds.lead.metrikaId,
              values: [
                {
                  value: result.metrikaId || null
                }
              ]
            }
          ]
        });
      }
    }
  }

  getTrackingParams = async (lead) => {
    var roistatId = this.findFieldValueById(lead.custom_fields_values, store.fieldIds.lead.roistat);
    var metrikaId = this.findFieldValueById(lead.custom_fields_values, store.fieldIds.lead.metrikaId);
    var site = amocrm.findFieldValueById(lead.custom_fields_values, store.fieldIds.lead.site);
    var phones = (lead.contact) ? this.findFieldValueById(lead.contact.custom_fields_values, store.fieldIds.contact.phone, true, clearPhone) : [];

    if (!site) {
      var mangoLine = amocrm.findFieldValueById(lead.custom_fields_values, store.fieldIds.lead.mangoLine);

      if (mangoLine) {
        site = store.mangoSites[mangoLine];
      }
    }

    let roistatResult = null;
    for await (const phone of phones) {
      roistatResult = await roistat.getCallerByPhone(phone).catch(err => console.log(err));

      if (roistatResult) {
        roistatId = roistatId || roistatResult.roistatId;
        metrikaId = metrikaId || roistatResult.metrikaId;
        site = site || roistatResult.site;
      }

      if (!roistatId || !metrikaId) {
        var prevLeads = await this.getAllEntities('leads', {
          query: phone,
          order: {
            created_at: 'desc'
          }
        });

        for (let j = 0; j < prevLeads.length; j++) {
          if (!roistatId) {
            roistatId = this.findFieldValueById(prevLeads[j].custom_fields_values, store.fieldIds.lead.roistat);
          }

          if (!metrikaId) {
            metrikaId = this.findFieldValueById(prevLeads[j].custom_fields_values, store.fieldIds.lead.metrikaId);
          }

          if (roistatId && metrikaId) {
            break;
          }
        }
      }
    }

    return {
      site: site,
      roistatId: roistatId,
      metrikaId: metrikaId
    }
  }

  getLeadsContacts = (leads) => {
    return new Promise(async (resolve, reject) => {
      var contactIds = leads.map(lead => {
        return (lead['_embedded'].contacts.length) ? lead['_embedded'].contacts[0].id : null;
      });

      var contacts = await this.getAllEntities('contacts', {
        filter: {
          id: contactIds
        }
      }).catch(err => console.log(`Не удалось получить контакт ${lead['_embedded'].contacts[0].id}: ${err}`));

      leads.map((lead, j) => {
        if (lead['_embedded'].contacts.length) {
          for (let i = 0; i < contacts.length; i++) {
            if (lead['_embedded'].contacts[0].id == contacts[i].id) {
              leads[j].contact = contacts[i];
              break;
            }
          }
        } else {
          leads[j].contact = {}
        }
      });

      resolve(leads);
    });
  }
}

export const amocrm = new AmoCRM();