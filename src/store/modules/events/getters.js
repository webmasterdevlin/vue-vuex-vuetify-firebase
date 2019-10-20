import * as types from "../../types";

const getters = {
  [types.GETTERS_INIT_EVENTS]: state => state.events,
  [types.GETTERS_INIT_EVENT]: state => state.event,
  [types.GETTERS_TOTAL_EVENTS]: state => state.events.length
};

export default getters;
