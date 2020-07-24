import { amocrm } from './amocrm.js';
import { dadataAddress, dadataPhone } from '../dadata/dadata.js';
import { roistat } from '../roistat/roistat.js';
import { formatPhone } from '../utils.js';
import { store } from '../store.js';

class LeadHook {
  constructor() {
    this.props = { ...store };
  }
  leadMeterWebhook = async (req) => {
    if (req.leads) {
      var leadId = (req.leads.add) ? req.leads.add[0].id : req.leads.status[0].id;

      await amocrm.updateTrackingParams({ id: leadId });

      var lead = await amocrm.getAllEntities('leads', {
        filter: {
          id: leadId
        },
        with: 'contacts'
      }, 1);

      lead = await amocrm.getLeadsContacts(lead);
      lead = lead[0];

      var phones = (lead.contact) ? amocrm.findFieldValueById(lead.contact.custom_fields_values, store.fieldIds.contact.phone, true, formatPhone) : [];
      var meterAddress = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.meterAddress);

      meterAddress = await dadataAddress('address', [meterAddress]);
      meterAddress = meterAddress[0];

      amocrm.updateEntity('leads', lead.id, {
        custom_fields_values: [
          {
            field_id: this.props.fieldIds.lead.meterAddress,
            values: [
              {
                value: meterAddress
              }
            ]
          }
        ]
      });

      amocrm.updateEntity('contacts', lead.contact.id, {
        custom_fields_values: [
          {
            field_id: this.props.fieldIds.contact.phone,
            values: phones.map(phone => {
              return { value: phone }
            })
          }
        ]
      });
    }
  }
}

export default new LeadHook();