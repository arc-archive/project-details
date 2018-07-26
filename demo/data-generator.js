/* global chance */
const DataGenerator = {};
const methods = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD'];
const methodsSize = methods.length - 1;
DataGenerator.createProjectObject = function() {
  var project = {
    _id: chance.string({length: 12}),
    name: chance.sentence({words: 2}),
    order: 0,
    description: chance.paragraph()
  };
  return project;
};

DataGenerator.genRequestObject = function(projectData) {
  var methodIndex = chance.integer({min: 0, max: methodsSize});
  var id = chance.string({length: 5});
  if (projectData) {
    id += '/' + projectData;
  }
  var obj = {
    _id: id,
    name: chance.sentence({words: 2}),
    method: methods[methodIndex],
    url: chance.url(),
    projectOrder: chance.integer({min: 0, max: 10}),
    legacyProject: projectData
  };
  return obj;
};

DataGenerator.generateRequests = function(projectId, size) {
  size = size || 25;
  var result = [];
  for (var i = 0; i < size; i++) {
    result.push(DataGenerator.genRequestObject(projectId));
  }
  return result;
};

DataGenerator.countProjectItems = function(requests, projectId) {
  var result = requests.filter(item => item.legacyProject &&
    item.legacyProject === projectId);
  return result.length;
};

DataGenerator.generateData = function(requestsSize) {
  var project = DataGenerator.createProjectObject();
  var requests = DataGenerator.generateRequests(project._id, requestsSize);
  var savedDb = new PouchDB('saved-requests');
  var projectsDb = new PouchDB('legacy-projects');
  return projectsDb.put(project)
  .then(result => {
    if (!result.ok) {
      throw new Error('Cannot insert project into the database');
    }
    return savedDb.bulkDocs(requests);
  })
  .then(() => project._id);
};

DataGenerator.destroyData = function() {
  var savedDb = new PouchDB('saved-requests');
  var projectsDb = new PouchDB('legacy-projects');
  return savedDb.destroy().then(() => projectsDb.destroy());
};
