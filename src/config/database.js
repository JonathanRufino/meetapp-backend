module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  database: 'meetapp',
  username: 'postgres',
  password: 'docker',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
