const mongoose = require("mongoose");
const { dbConfig } = require("../config/config.js")

const connectDb = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const connectDb = await mongoose.connect(dbConfig.uri, {
                // useNewUrlParser: true,
                // useUnifiedTopology: true,
                // useCreateIndex: true,
                // useFindAndModify: false
            });

            console.info(`Database Connected`);
            resolve()
        } catch (error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
            process.exit(1); // Exit process with failure
            reject(error);
        }
    })
}

module.exports = connectDb;