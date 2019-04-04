import {DataGenerator} from '../../arc-data-generator/arc-data-generator.js';
export const DataHelper = {};
DataHelper.generateData = function() {
  return DataGenerator.insertSavedRequestData({
    projectsSize: 2,
    requestsSize: 20
  })
  .then((data) => {
    const projectId = data.projects[0]._id;
    const requests = [];
    data.requests.forEach((item) => {
      if (item.projects && item.projects.indexOf(projectId) !== -1) {
        requests.push(item);
      }
    });
    return {
      projectId,
      requests,
      projects: data.projects
    };
  });
};

DataHelper.loaded = [false, false];
DataHelper.doneWhenLoaded = function(element) {
  DataHelper.loaded = [false, false];
  return new Promise((resolve) => {
    function checkDone() {
      if (DataHelper.loaded[0] && DataHelper.loaded[1]) {
        resolve();
      }
    }
    element.addEventListener('loading-project-changed', function c1(e) {
      if (e.detail.value === false) {
        element.removeEventListener('loading-project-changed', c1);
        DataHelper.loaded[0] = true;
        checkDone();
      }
    });
    const list = element.shadowRoot.querySelector('project-requests-list');
    list.addEventListener('loading-requests-changed', function c2(e) {
      if (e.detail.value === false) {
        list.removeEventListener('loading-requests-changed', c2);
        DataHelper.loaded[1] = true;
        checkDone();
      }
    });
  });
};
