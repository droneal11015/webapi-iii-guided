const express = require('express'); // importing a CommonJS module
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');



const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

//global middleware
server.use(express.json());
server.use(helmet());
server.use(logger('dev'));
server.use(cors());
server.use(methodLogger);
//server.use(lockout);
//server.use(timecrunch);

//route handler
server.use('/api/hubs', hubsRouter);

//route handler
server.get('/', /*add middleware here-->*/ addName, (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

//global middleware 
function methodLogger(req, res, next){
  console.log(`${req.method} Request. Testing`);
  next();
}

//local middleware
function addName(req, res, next){
  req.name = req.name || 'Dani';
  next();
}

function lockout(req, res, next){
  res.status(403).json({ message: 'API lockout!'})
}

// function timecrunch(req, res, next){
//   const seconds = new Date().getSeconds()

//   if (seconds % 3 === 0){
//     res.status(403).json({ message: 'You shall not pass!'});
//   } else {
//     next();
//   }
// }

module.exports = server;
