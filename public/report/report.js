import { amocrm } from '../amocrm/amocrm.js';
import { formatPhone, timestampToDate } from '../utils.js';
import { roistat } from '../roistat/roistat.js';

export default class Report {
  constructor() {
    this.props = {
      pipelineId: 1645597,
      statusIds: {
        meter: 24924787,
        success: 142,
        decline: 143
      },
      fieldIds: {
        lead: {
          roistat: 528589,
          site: 639553,
          itemType: 683203,
          meterDate: 556365,
          meterAddress: 556363,
          meterTime: 556377,
          meterInfo: 643929,
          meterMaster: 556381
        },
        contact: {
          phone: 528543
        }
      }
    }
  }

  // Получить число СОЗДАННЫХ замеров за интервал дат
  getLeadCreatedAt = (interval, onlyCount = false) => {
    return new Promise(async (resolve, reject) => {
      var result = [];

      var setLeadAddressEvents = await amocrm.getAllEntities('events', {
        filter: {
          entity: 'lead',
          type: `custom_field_${this.props.fieldIds.lead.meterDate}_value_changed`,
          value_before: {
            value: ' '
          },
          created_at: `${interval.from},${interval.to}`
        }
      });

      var leadIds = setLeadAddressEvents.map(event => event.entity_id);

      var changeStatusEvents = await amocrm.getAllEntities('events', {
        filter: {
          entity: 'lead',
          type: `lead_status_changed`,
          value_after: {
            leads_statuses: [{
              pipeline_id: this.props.pipelineId,
              status_id: this.props.statusIds.meter
            }]
          },
          created_at: `${interval.from},${interval.to}`
        }
      });

      var cost = await roistat.getMarketingCost(interval);

      leadIds = leadIds.concat(changeStatusEvents.map(event => event.entity_id));
      leadIds = leadIds.filter((item, index) => leadIds.indexOf(item) === index);

      if (onlyCount) {
        resolve(leadIds.length);
      } else {
        if (leadIds.length) {
          this.getLeadInfo(leadIds).then(res => {
            resolve(this.makeResult(res, cost));
          }).catch(err => console.log(`Не удалось получить информацию о сделке: ${err}`));
        } else {
          resolve([])
        }
      }
    })
  }

  // Получить число НАЗНАЧЕННЫХ замеров на интервал дат
  getLeadMeterAt = (interval, onlyCount = false) => {
    return new Promise(async (resolve, reject) => {
      var leads = await amocrm.getLeadByMeterDateHack(interval);

      var cost = await roistat.getMarketingCost(interval);

      if (!leads.length) {
        resolve([]);
      } else {
        var leadIds = leads.map(lead => lead.id);

        if (onlyCount) {
          resolve(leadIds.length);
        } else {
          if (leadIds.length) {
            this.getLeadInfo(leadIds).then(res => {
              resolve(this.makeResult(res, cost));
            }).catch(err => console.log(`Не удалось получить информацию о сделке: ${err}`));
          } else {
            resolve([]);
          }
        }
      }
    });
  }

  // Получить число ЗАКРЫТЫХ замеров на интервал дат
  getLeadClosedAt = (interval, onlyCount = false) => {
    return new Promise(async (resolve, reject) => {
      var leads = await amocrm.getAllEntities('events', {
        filter: {
          entity: 'lead',
          type: `lead_status_changed`,
          value_after: {
            leads_statuses: [{
              pipeline_id: this.props.pipelineId,
              status_id: this.props.statusIds.success
            }, {
              pipeline_id: this.props.pipelineId,
              status_id: this.props.statusIds.decline
            }]
          },
          created_at: `${interval.from},${interval.to}`
        }
      });

      var leadIds = leads.map(event => event.entity_id);
      leadIds = leadIds.filter((item, index) => leadIds.indexOf(item) === index);

      var cost = await roistat.getMarketingCost(interval);

      if (!leads.length) {
        resolve([]);
      } else {
        if (leadIds.length) {
          this.getLeadInfo(leadIds, [{
            field: this.props.fieldIds.lead.meterDate,
            filter: 'not empty'
          }]).then(res => {
            if (onlyCount) {
              resolve(res.length);
            } else {
              resolve(this.makeResult(res, cost));
            }
          }).catch(err => console.log(`Не удалось получить информацию о сделке: ${err}`));
        } else {
          resolve([]);
        }
      }
    });
  }

  makeResult = (res, cost) => {
    var byStatus = this.countLeadsByStatus(res);

    return {
      data: res,
      cost: cost,
      total: res.length,
      totalSuccess: byStatus.success,
      sale: this.calcSale(res),
      byStatus: byStatus.list,
      bySite: this.countLeadsByProp(res, 'site'),
      byMeterMaster: this.countLeadsByProp(res, 'meterMaster'),
      byUser: this.countLeadsByProp(res, 'userName'),
      byType: this.countLeadsByProp(res, 'itemType')
    };
  }

  calcSale = (leads) => {
    return leads.reduce((accumulator, lead) => accumulator + lead.price, 0);
  }

  countLeadsByStatus = (leads) => {
    var result = {};

    leads.map((lead, i) => {
      if (!result[lead.status.id]) {
        result[lead.status.id] = {
          count: 1,
          name: lead.status.name
        };
      } else {
        result[lead.status.id].count++;
      }
    });

    return {
      success: (result[this.props.statusIds.success]) ? result[this.props.statusIds.success].count : 0,
      list: Object.values(result).map(obj => obj)
    };
  }

  countLeadsByProp = (leads, prop) => {
    var result = {};

    leads.map((lead, i) => {
      lead[prop] = (lead[prop]) ? lead[prop] : "Не указано";

      if (!result[lead[prop]]) {
        result[lead[prop]] = {
          count: 1,
          name: lead[prop],
        };
      } else {
        result[lead[prop]].count++;
      }
      if (!result[lead[prop]][lead.status.id]) {
        result[lead[prop]][lead.status.id] = {
          count: 1,
          name: lead.status.name
        };
      } else {
        result[lead[prop]][lead.status.id].count++;
      }
    });

    return Object.values(result).map(obj => obj);
  }

  getLeadInfo = async (ids, cfFilter = []) => {
    var leads = await amocrm.getAllEntities('leads', {
      filter: {
        id: ids
      },
      order: {
        created_at: 'asc'
      },
      with: 'contacts'
    });

    leads = await this.getLeadsContacts(leads);

    var result = await Promise.all(leads.map(async lead => {
      var allFilterDone = true;

      cfFilter.map(filter => {
        var fieldValue = this.findFieldValueById(lead.custom_fields_values, filter.field);
        if (filter.filter == 'not empty' && !fieldValue) {
          allFilterDone = false;
        }
      });

      if (allFilterDone) {
        var status = amocrm.findStatus(lead.status_id);
        var statusValue = 'wait';
        if (status.id == 142) {
          statusValue = 'done';
        } else if (status.id == 143) {
          statusValue = 'decline';
        }
        status = {
          id: status.id,
          name: status.name,
          value: statusValue
        };

        var user = await amocrm.getUserData(lead.responsible_user_id);
        var contactName = (lead.contact) ? lead.contact.name : '';
        var phones = (lead.contact) ? this.findFieldValueById(lead.contact.custom_fields_values, this.props.fieldIds.contact.phone, true, formatPhone) : [];
        var site = this.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.site);
        var createdAt = timestampToDate(lead.created_at);
        var meterAddress = this.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.meterAddress);
        var meterDate = this.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.meterDate, false, timestampToDate);
        var meterTime = this.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.meterTime);
        var meterMaster = this.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.meterMaster);
        var meterInfo = this.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.meterInfo);
        var itemType = this.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.itemType);
        var userName = user.name;
        var price = lead.price;

        return {
          id: lead.id,
          price: price,
          status: status,
          userName: userName,
          createdAt: createdAt,
          contact: {
            name: contactName,
            phones: phones,
          },
          site: site,
          address: meterAddress,
          meterDate: meterDate,
          itemType: itemType || 'Двери',
          meterTime: meterTime,
          meterMaster: meterMaster,
          meterInfo: meterInfo || ''
        }
      } else {
        return '';
      }
    }));

    result = result.filter(function (el) {
      return el;
    });

    return result;
  }

  getLeadsContacts = (leads) => {
    return new Promise(async (resolve, reject) => {
      var contactIds = leads.map(lead => {
        return (lead['_embedded'].contacts.length) ? lead['_embedded'].contacts[0].id : null;
      });

      var contacts = await amocrm.getAllEntities('contacts', {
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
}