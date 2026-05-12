module.exports = (appInfo) => {
  const config = (exports = {});

  config.keys = appInfo.name + "_1778484096";

  config.middleware = [];

  config.sequelize = {
    dialect: "sqlite",
    storage: "./data/courses.db",
    define: {
      timestamps: true,
      underscored: true,
    },
  };

  config.cors = {
    origin: "*",
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
  };

  config.cluster = {
    listen: {
      port: 7890,
    },
  };

  return config;
};
