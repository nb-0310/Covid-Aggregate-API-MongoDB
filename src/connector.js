const mongoose = require('mongoose');
const { tallySchema } = require('./schema');

mongoose.connect('mongodb://localhost:27017/covidtally', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

const collection_connection = mongoose.model('covidtally', tallySchema);

exports.connection = collection_connection;