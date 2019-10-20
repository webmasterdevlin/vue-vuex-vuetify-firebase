import * as types from "../../types";

const mutations = {
  [types.MUTATE_GET_EVENTS](state, events) {
    let fetchedData = [];
    events.forEach(doc => {
      let appData = doc.data();
      appData.id = doc.id;
      fetchedData.push(appData);
    });

    state.events = fetchedData;
  },

  [types.MUTATE_ADD_EVENT](state, eventData) {},
  [types.MUTATE_REMOVE_EVENT](state, id) {
    state.events = state.events.filter(e => e.id !== id);
  },
  [types.MUTATE_UPDATE_EVENT](state, event) {
    const index = state.events.findIndex(e => e.id === event.id);
    state.events[index] = event;
  },

  [types.MUTATE_ERROR_EVENT](state, errorMessage) {
    state.error = errorMessage;
    alert("Something happened: " + errorMessage);
  },

  [types.MUTATE_ISLOADING_EVENT](state, toggle) {
    state.isLoading = toggle;
  }
};

export default mutations;
