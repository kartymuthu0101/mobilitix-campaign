const express = require("express");
const cors = require("cors");
const connectDb = require("./utils/connectDb.js");
const router = require("./routes/index.js");
const swagger = require("./utils/swagger.js");
const { port } = require("./config/config.js");

const path = require('path');
(async function server() {
    try {
        const app = express();

        await connectDb();
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use('/uploads', express.static(path.join(__dirname, './modules/Razona/uploads')));
        swagger(app);

        app.use(cors());
        app.use("/api", router);

        app.listen(port, () => console.info(`Server is running on port ${port}`));

    } catch (error) {
        console.error("ERROR", error)
    }
})();

