
const DataGenerator = {};
const methods = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD'];
const methodsSize = methods.length - 1;
DataGenerator.createProjectObject = function() {
  /* global chance */
  const project = {
    _id: chance.string({length: 12}),
    name: chance.sentence({words: 2}),
    order: 0,
    description: chance.paragraph()
  };
  return project;
};

DataGenerator.genRequestObject = function(projectData) {
  const methodIndex = chance.integer({min: 0, max: methodsSize});
  let id = chance.string({length: 5});
  if (projectData) {
    id += '/' + projectData;
  }
  const obj = {
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
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(DataGenerator.genRequestObject(projectId));
  }
  return result;
};

DataGenerator.countProjectItems = function(requests, projectId) {
  const result = requests.filter((item) => item.legacyProject &&
    item.legacyProject === projectId);
  return result.length;
};

DataGenerator.generateData = function(requestsSize) {
  const project = DataGenerator.createProjectObject();
  const requests = DataGenerator.generateRequests(project._id, requestsSize);
  /* global PouchDB */
  const savedDb = new PouchDB('saved-requests');
  const projectsDb = new PouchDB('legacy-projects');
  return projectsDb.put(project)
  .then((result) => {
    if (!result.ok) {
      throw new Error('Cannot insert project into the database');
    }
    return savedDb.bulkDocs(requests);
  })
  .then(() => project._id);
};

DataGenerator.destroyData = function() {
  const savedDb = new PouchDB('saved-requests');
  const projectsDb = new PouchDB('legacy-projects');
  return savedDb.destroy().then(() => projectsDb.destroy());
};
