const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = (app) => {
  const modulesPath = path.join(__dirname, '../modules');

  fs.readdirSync(modulesPath).forEach((moduleName) => {
    const routeFile = path.join(
      modulesPath,
      moduleName,
      `${moduleName}.routes.js`
    );

    if (fs.existsSync(routeFile)) {
      const router = require(routeFile);
      app.use(`/api/v1/${moduleName}`, router);
      logger.info(`Loaded route: /api/v1/${moduleName}`);
    }
  });
};