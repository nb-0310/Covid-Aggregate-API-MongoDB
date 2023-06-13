const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')


app.get('/totalRecovered', async (req, res) => {
  const result = await connection.aggregate([
    {
      $group: {
        _id: 'total',
        recovered: { $sum: '$recovered' }
      }
    }
  ]);
  res.json({ data: result[0] });
});

app.get('/totalActive', async (req, res) => {
  const result = await connection.aggregate([
    {
      $group: {
        _id: 'total',
        active: { $sum: { $subtract: ['$infected', '$recovered'] } }
      }
    }
  ]);
  res.json({ data: result[0] });
});

app.get('/totalDeath', async (req, res) => {
  const result = await connection.aggregate([
    {
      $group: {
        _id: 'total',
        death: { $sum: '$death' }
      }
    }
  ]);
  res.json({ data: result[0] });
});

app.get('/hotspotStates', async (req, res) => {
  const result = await connection.aggregate([
    {
      $addFields: {
        rate: {
          $round: [{ $divide: [{ $subtract: ['$infected', '$recovered'] }, '$infected'] }, 5]
        }
      }
    },
    {
      $match: {
        rate: { $gt: 0.1 }
      }
    },
    {
      $project: {
        _id: 0,
        state: 1,
        rate: 1
      }
    }
  ]);
  res.json({ data: result });
});

app.get('/healthyStates', async (req, res) => {
  const result = await connection.aggregate([
    {
      $addFields: {
        mortality: {
          $round: [{ $divide: ['$death', '$infected'] }, 5]
        }
      }
    },
    {
      $match: {
        mortality: { $lt: 0.005 }
      }
    },
    {
      $project: {
        _id: 0,
        state: 1,
        mortality: 1
      }
    }
  ]);
  res.json({ data: result });
});

mongoose.connect('mongodb://localhost:27017/covidtally', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;