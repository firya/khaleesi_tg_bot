import { amocrm } from './amocrm.js';
import { metrika } from '../metrika/metrika.js';
import { store } from '../store.js';

class MetrikaHook {
  constructor() {
    this.props = { ...store };
  }
  metrikaSaleWebHook = async (req) => {
    if (req.leads) {
      var leadId = (req.leads.add) ? req.leads.add[0].id : req.leads.status[0].id;
      var lead = await amocrm.getAllEntities('leads', {
        filter: {
          id: leadId
        }
      }, 1);

      lead = lead[0];

      var metrikaId = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.metrikaId);
      var price = lead.price.toFixed(2);

      if (metrikaId) {
        const headers = ['ClientId', 'Target', 'DateTime', 'Price', 'Currency'];
        const data = [[metrikaId, 'METER', Math.round(new Date().getTime() / 1000), price, 'RUB']];

        metrika.postCSVData(headers, data).then(res => console.log(res));
      }
    }
  }
  metrikaMeterWebHook = async (req) => {
    if (req.leads) {
      var leadId = (req.leads.add) ? req.leads.add[0].id : req.leads.status[0].id;
      var lead = await amocrm.getAllEntities('leads', {
        filter: {
          id: leadId
        }
      }, 1);

      lead = lead[0];

      var metrikaId = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.metrikaId);

      if (metrikaId) {
        const headers = ['ClientId', 'Target', 'DateTime'];
        const data = [[metrikaId, 'METER', Math.round(new Date().getTime() / 1000)]];

        metrika.postCSVData(headers, data).then(res => console.log(res));
      }
    }
  }
}

export default new MetrikaHook();