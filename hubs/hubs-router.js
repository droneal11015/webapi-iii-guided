const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Hubs Router!');
  next();
});

// this only runs if the url has /api/hubs in it
router.get('/', async (req, res) => {
  try {
    const hubs = await Hubs.find(req.query);
    res.status(200).json(hubs);
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the hubs',
    });
  }
});

// /api/hubs/:id

router.get('/:id', validateId, async (req, res) => { /*checks if id exists*/
  res.status(200).json(req.hub);
});

router.post('/',requireBody, async (req, res) => {
  try {
    const hub = await Hubs.add(req.body);
    res.status(201).json(hub);
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error adding the hub',
    });
  }
});

router.delete('/:id', validateId, async (req, res) => {
  try {
    const count = await Hubs.remove(req.params.id);
    if (count > 0) {
      res.status(200).json({ message: 'The hub has been nuked' });
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error removing the hub',
    });
  }
});

router.put('/:id', [validateId,requireBody], async (req, res) => {
  try {
    const hub = await Hubs.update(req.params.id, req.body);
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error updating the hub',
    });
  }
});

// add an endpoint that returns all the messages for a hub
// this is a sub-route or sub-resource
router.get('/:id/messages', [validateId, requireBody], async (req, res) => {
  try {
    const messages = await Hubs.findHubMessages(req.params.id);

    res.status(200).json(messages);
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  }
});

// add an endpoint for adding new message to a hub
router.post('/:id/messages', validateId, async (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  try {
    const message = await Messages.add(messageInfo);
    res.status(210).json(message);
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  }
});

function validateId(req, res, next){ /*validateId needs to be put anywhere :id is */
  const {id} = req.params; /*destructuring id from req.params*/
  Hubs.findById(id) /*if id exists*/
    .then(hub => {
      if(hub) {
        req.hub = hub;
        next();
      } else /*if id doesn't exist*/
      {res.status(404).json ({ message: 'Invalid id; hub id was not found'})
    }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Failed to process request'});
    });
}

function requireBody(req, res, next){
  //if req.body is not defined and is an empty object, it should cancel the 
  //request and send back a status of 400 with the message "please include request body"
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    res.status(400).json({ message: 'Please include request body'});
  }
}


module.exports = router;

//created local middlewares, created functions that acted as middleware and customized errors