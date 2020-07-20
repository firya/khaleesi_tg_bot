import { amocrm } from './amocrm.js';
import { roistat } from '../roistat/roistat.js';
import { clearPhone, formatPhone } from '../utils.js';
import { store } from '../store.js';

class CreateHook {
  constructor() {
    this.props = { ...store };
  }
  createWebhook = async (req) => {
    if (req.leads) {
      var leadId = (req.leads.add) ? req.leads.add[0].id : req.leads.status[0].id;

      amocrm.updateTrackingParams({ id: leadId });
    }
  }
}

export default new CreateHook();