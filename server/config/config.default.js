module.exports = appInfo => {
  const config = exports = {};

  config.keys = appInfo.name + '_1715631385000_1234';

  config.middleware = [];

  config.sequelize = {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    define: {
      timestamps: true,
      underscored: true,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.cluster = {
    listen: {
      port: 7001,
    },
  };

  return config;
};
