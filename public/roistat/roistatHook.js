import { amocrm } from '../amocrm/amocrm.js';
import { store } from '../store.js';

class RoistatHook {
  constructor() {
    this.props = { ...store };
  }
  roistatNewCallHook = async (req) => {
    if (req) {
      var lead = await amocrm.getAllEntities('leads', {
        query: req.caller
      }, 1);

      if (lead.length) {
        lead = lead[0];
        const site = req.domain;
        const roistat = req.visit_id;
        const metrikaId = req.metrika_client_id;

        const note = `Источник: ${req.source_level_1} \nСтраница захвата: ${req.landing_page}`;

        amocrm.addNote('leads', lead.id, note);

        amocrm.updateEntity('leads', lead.id, {
          custom_fields_values: [
            {
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
                  value: roistat
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
      }
    }
  }
}

export default new RoistatHook();