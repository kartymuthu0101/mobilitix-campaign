import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../../utils/connectDb.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Models container
const db = {};

// Load models from individual module directories
const moduleFolder = path.join(__dirname, '../../modules');
const modules = fs.readdirSync(moduleFolder);

// Import all model files
// const importModels = async () => {
for (const module of modules) {
    const modulePath = path.join(moduleFolder, module);

    // Skip if not a directory
    if (!fs.statSync(modulePath).isDirectory()) {
        continue;
    }

    // Find model files in the module directory
    const modelFiles = fs.readdirSync(modulePath)
        .filter(file => file.includes('.model.js'));

    // Import each model
    for (const modelFile of modelFiles) {
        const modelPath = path.join(modulePath, modelFile);
        const modelModule = await import(
            // Convert to file URL for ES modules import
            `file://${path.resolve(modelPath)}`
        );

        // Add model to db if it has a name
        const model = modelModule.default;
        if (model?.name) {
            db[model.name] = model;
        }
    }
}

// Establish associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
// };

// Call the import function
// importModels()
//     .then(() => console.log('Models loaded successfully'))
//     .catch(err => console.error('Error loading models:', err));

// Add sequelize instance to db
db.sequelize = sequelize;

export default db;