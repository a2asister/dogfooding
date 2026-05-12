module.exports = appInfo => {
  const config = exports = {};

  config.keys = appInfo.name + '_1715403804658_8765';

  config.middleware = [];

  config.sequelize = {
    dialect: 'sqlite',
    storage: './data/learning.db',
    dialectOptions: {},
    define: {
      timestamps: true,
      underscored: false,
    },
  };

  config.graphql = {
    router: '/graphql',
    app: true,
    agent: false,
    defaultEmptySchema: true,
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
  };

  config.security = {
    csrf: {
      enable: false,
    },
    methodnoallow: {
      enable: false,
    },
    domainWhiteList: ['*'],
  };

  const userConfig = {};

  return {
    ...config,
    ...userConfig,
  };
};
