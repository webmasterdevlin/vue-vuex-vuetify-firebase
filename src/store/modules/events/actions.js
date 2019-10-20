import * as types from "../../types";
import { db } from "../../../main";

const actions = {
  [types.ACTION_GET_EVENTS]({ commit }) {
    commit(types.MUTATE_ISLOADING_EVENT, true);
    return db
      .collection("calEvent")
      .get()
      .then(response => {
        commit(types.MUTATE_GET_EVENTS, response);
        return Promise.resolve();
      })
      .catch(({ message }) => {
        commit(types.MUTATE_ERROR_EVENT, message);
      })
      .finally(() => commit(types.MUTATE_ISLOADING_EVENT, false));
  },

  [types.ACTION_ADD_EVENT]({ commit }, eventData) {
    commit(types.MUTATE_ISLOADING_EVENT, true);
    return db
      .collection("calEvent")
      .add(eventData)
      .then(() => {
        return Promise.resolve();
      })
      .catch(({ message }) => {
        commit(types.MUTATE_ERROR_EVENT, message);
      })
      .finally(() => commit(types.MUTATE_ISLOADING_EVENT, false));
  },

  [types.ACTION_REMOVE_EVENT]({ commit, getters }, event) {
    // Optimistic UI update
    const previousEvents = getters.GETTERS_INIT_EVENTS;
    commit(types.MUTATE_REMOVE_EVENT, event.id);
    return db
      .collection("calEvent")
      .doc(event.id)
      .delete()
      .then(() => {
        return Promise.resolve();
      })
      .catch(({ message }) => {
        commit(types.MUTATE_GET_EVENTS, previousEvents);
        commit(types.MUTATE_ERROR_EVENT, message);
      });
  },

  [types.ACTION_UPDATE_EVENT]({ commit }, event) {
    // Optimistic UI update
    const previousEvents = getters.GETTERS_INIT_EVENTS;
    commit(types.MUTATE_UPDATE_EVENT, event);
    return db
      .collection("calEvent")
      .doc(event.id)
      .update({
        name: event.name,
        details: event.details
      })
      .then(() => {
        return Promise.resolve();
      })
      .catch(({ message }) => {
        commit(types.MUTATE_GET_EVENTS, previousEvents);
        commit(types.MUTATE_ERROR_EVENT, message);
      });
  }
};

export default actions;
