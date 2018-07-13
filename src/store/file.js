import Vue from 'vue';
import remote from '@/scripts/fetchFile';
import db from '@/scripts/db';
import router from '@/router';

const file = {
  state: () => ({
    id: [/* id */],
    fileData: {/* [id: id]: data */},
    assetsDownloaded: {/* [id: id]: boolean */},
    errInfo: '',
    status: {
      fileUploaded: false,
      localStorageRdy: false,
      balloonsRdy: false,
    },
  }),

  mutations: {
    SET_ID(state, { id }) {
      state.id.push(id);
    },

    SET_FILEDATA(state, { data }) {
      const balloonsToObj = data.balloons.reduce((acc, val, idx) => {
        acc[idx] = val;
        return acc;
      }, {});
      Vue.set(state.fileData, data.info.id, {});
      Vue.set(state.fileData[data.info.id], 'info', data.info);
      Vue.set(state.fileData[data.info.id], 'balloons', balloonsToObj);
    },

    SET_ASSETS_DOWNLOAD_STATUS(state, { id, status = false }) {
      Vue.set(state.assetsDownloaded, id, status);
    },

    ADD_BALLOON_DATAURI(state, { id, blob, balloonIdx }) {
      db.addFileBalloons({ id, blob, balloonIdx });
    },

    SET_STATUS(state, { type, status }) {
      state.status[type] = status;
    },

    CLEAR_STATUS(state) {
      state.status.fileUploaded = false;
      state.status.localStorageRdy = false;
      state.status.balloonsRdy = false;
    },

  },

  actions: {
    async fetchParts({ commit }, { formData }) {
      const { data } = await remote.uploadPicture(formData);
      if (!data) throw new Error('Cannot fetch data.');
      // await db.movePreviewToFile({ id: data.info.id });
      commit('SET_STATUS', { type: 'fileUploaded', status: true });
      commit('SET_ID', { id: data.info.id });
      commit('SET_ASSETS_DOWNLOAD_STATUS', { id: data.info.id, status: false });
      commit('SET_FILEDATA', { data });
      // commit('ADD_PREVIEW_TO_FILEDATA', { id: data.info.id });
      commit('PREPARE_CANVAS', { id: data.info.id, balloons: data.balloons, balloonCount: data.info.balloonCount });
      commit('SET_STATUS', { type: 'localStorageRdy', status: true });
    },

    clearStatus({ commit }) {
      commit('CLEAR_STATUS');
    },

    resetCanvas({ commit, state }, { id }) {
      commit('PREPARE_CANVAS', { id, balloons: state.fileData[id].balloons, balloonCount: state.fileData[id].info.balloonCount });
    },

  },
};

export default file;
