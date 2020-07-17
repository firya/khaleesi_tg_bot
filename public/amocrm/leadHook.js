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

      var lead = await amocrm.getAllEntities('leads', {
        filter: {
          id: leadId
        },
        with: 'contacts'
      }, 1);

      lead = await amocrm.getLeadsContacts(lead);
      lead = lead[0];

      var roistatId = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.roistat);
      var metrikaId = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.metrikaId);
      var meterAddress = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.meterAddress);
      var mangoLine = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.mangoLine);
      var site = amocrm.findFieldValueById(lead.custom_fields_values, this.props.fieldIds.lead.site);
      var phones = (lead.contact) ? amocrm.findFieldValueById(lead.contact.custom_fields_values, this.props.fieldIds.contact.phone, true, formatPhone) : [];

      if (!site) {
        if (mangoLine) {
          site = this.props.mangoSites[mangoLine];
        }
      }

      meterAddress = await dadataAddress('address', [meterAddress]);
      meterAddress = meterAddress[0];

      if (!roistatId || !metrikaId) {
        let roistatResult = null;
        for await (const phone of phones) {
          roistatResult = await roistat.getCallerByPhone(phone);
        }

        if (roistatResult.roistat_id || roistatResult.metrika_id) {
          roistatId = roistatId || roistatResult.roistat_id;
          metrikaId = metrikaId || roistatResult.metrika_id;
        }

        site = site || roistatResult.site;

        if (!roistatId || !metrikaId) {
          for (let i = 0; i < phones.length; i++) {
            var prevLeads = await amocrm.getAllEntities('leads', {
              query: phones[i],
              order: {
                created_at: 'desc'
              }
            });

            for (let j = 0; j < prevLeads.length; j++) {
              if (!roistatId) {
                roistatId = amocrm.findFieldValueById(prevLeads[j].custom_fields_values, this.props.fieldIds.lead.roistat);
              }

              if (!metrikaId) {
                metrikaId = amocrm.findFieldValueById(prevLeads[j].custom_fields_values, this.props.fieldIds.lead.metrikaId);
              }

              if (roistatId && metrikaId) {
                break;
              }
            }
          }
        }
      }

      amocrm.updateEntity('leads', lead.id, {
        custom_fields_values: [
          {
            field_id: this.props.fieldIds.lead.meterAddress,
            values: [
              {
                value: meterAddress
              }
            ]
          }, {
            field_id: this.props.fieldIds.lead.site,
            values: [
              {
                value: site
              }
            ]
          }, {
            field_id: this.props.fieldIds.lead.roistat,
            values: [
              {
                value: roistatId
              }
            ]
          }, {
            field_id: this.props.fieldIds.lead.metrikaId,
            values: [
              {
                value: metrikaId
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