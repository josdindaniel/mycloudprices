const mongoose = require('mongoose');
const { mongodb } = require('./keys');
const fs = require('fs');

mongoose.connect(mongodb.URI, {
    useNewUrlParser: true,
    ssl: true,
    sslValidate: false,
    sslCA: fs.readFileSync('src/rds-combined-ca-bundle.pem')})
    .then(db => console.log('Database is connected'))
    .catch(err =>  console.error(err));
