const express = require('express');
const helmet = require ('helmet')
const userdb = require ('./users/userDb');
const postdb = require ('./posts/postDb');

const server = express();

///global middlware
server.use(express.json());
server.use(helmet());
server.use(logger)


server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`)
});

//CRUD for users

server.get('/users', (req, res) => {
  userdb
    .get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        err})
    })
});

server.get('/users/:id', validateUserId, (req, res) => {
    res.status(200).json(req.user)
})

server.post('/users', validateUser, (req, res) => {
 const { name } = req.body 
  userdb
    .insert({ name })
    .then(user => {
      res.status(201).json(user)
    })
    .catch(err => {
      res.status(500).json({message: "Could not add a new user" })
    })
})

server.delete('/users/:id', validateUserId, (req, res) => {
  userdb
    .remove(req.user)
    .then(user => {
      res.status(202).json({ success: 'user sucessfully deleted!' })
    })
    .catch(err => {
      res.status(500).json({message: "could not be deleted"})
    })
})

server.put('/users/:id', validateUser, validateUserId, (req, res) => {
  const { name } = req.body
  userdb
    .update(req.user, { name } )
    .then(user => {
      res.status(202).json({success: 'User updated!'})
    })
    .catch(err => {
      res.status(500).json({message: 'Could not be updated'})
    })
})

server.get('/users/posts/:userId', (req, res) => {
  const { userId } = req.params;
  userdb
    .getUserPosts(userId)
    .then(posts => {
      if (posts === 0) {
       res.status(404).json({message: 'No posts from that users'})
      }
      res.status(200).json(posts)
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        err})
    })
})

server.post('/posts', validatePost, (req, res) => {
  const { user_id, text } = req.body
  postdb
    .insert({ user_id, text })
    .then(post => {
      res.status(201).json(post)
    })
    .catch(err => {
      res.status(500).json({
        message: "could not be posted" })
    })
})

//custom middleware

function logger(req, res, next) {
req.time = new Date();
console.log(`A ${req.method} request to '${req.url}' at ${req.time.toISOString()} `)
next()
};
//logger is used globally

function validateUserId(req, res, next) {
  const { id } = req.params
  userdb.getById(id)
  .then( user => {
    if (user) {
      req.user = user
      next()
    } else {
      res.status(400).json({message: "invalid user id" })
    }
  })
  .catch(err => {
    res.status(500).json({err})
  })  
}
  
//locally

function validateUser(req, res, next) {
  const { name } = req.body;
  if (!req.body){
    res.status(400).json({message: "missing user data" })
    next()
  } else if(!name) {
    res.status(400).json({message: "missing required name field"})
    next()
  } else {
    next()
  }
}
//locally

function validatePost(req, res, next) {
  const { text } = req.body;
  if (!req.body){
    res.status(400).json({message: "missing post data"})
    next()
  } else if(!text) {
    res.status(400).json({message: "missing required text field"})
    next()
  } else {
    next()
  }
}
//locally


module.exports = server;
