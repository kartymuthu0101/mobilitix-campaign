// src/models/index.js
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../utils/connectDb');

const db = {};

// Load models from individual module directories
const moduleFolder = path.join(__dirname, '../modules');
const modules = fs.readdirSync(moduleFolder);

modules.forEach(module => {
  const modulePath = path.join(moduleFolder, module);
  if (fs.statSync(modulePath).isDirectory()) {
    const modelFiles = fs.readdirSync(modulePath)
      .filter(file => file.includes('.model.js'));
    
    modelFiles.forEach(modelFile => {
      const model = require(path.join(modulePath, modelFile));
      if (model.name) {
        db[model.name] = model;
      }
    });
  }
});

// Establish associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;