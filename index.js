"use strict";

require('dotenv').config();
const axios = require('axios');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

app.use('/book',validateToken, express.static("./static/md/book/html"));

app.get('/auth', (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
  );
});

app.get('/oauth_redirect',function (req,res) {
  console.log("req: ",req);
})

app.get('/oauth_callback', (req, res) => {
  let {url} = req;

  console.log("url: ",url);
  let precode = url.split('?')[1]; // needs error checking
  let code = precode.split('=')[1]; // needs error checking
  let { query } = req;
  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    // redirect_uri='http://localhost:3000/oauth_redirect',
    client_secret: process.env.GITHUB_SECRET,
    code,
  };
  const opts = { 
    headers: { 
      'Content-Type': 'application/json', 
      'accept': 'application/json' 
    } 
  };
  axios
    .post('https://github.com/login/oauth/access_token', body, opts)
    .then((_res) => { 
      return _res.data.access_token
    })
    .then((token) => {
      console.log('My token:', token);
      res.redirect(`/?token=${token}`);
    })
    .catch((err) => res.status(500).json({ err: err.message }));
});

function validateToken() {
  
  // do in axios $ curl -H "Authorization: token OAUTH-TOKEN" https://api.github.com

  
}


function authenticateRequest(req, res, next) {
  /**
   * 1. Makes a protected call to remote resource
   * 2. Remote resource authenticates request then sends a zipped book over
   * 3. Oauth2 server has a proxy mechanism to pipe over large files in a queue like setting
   * 4. After certain amount of time the queue is completed then a route is dynamically modified
   * 5. There is a toggle switch and now the /book route serves the unzipped static contents
   * 
   */  
}




app.listen(3000);
console.log('App listening on port 3000');
