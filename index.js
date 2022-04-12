"use strict";

require('dotenv').config();
const LRU = require('lru-cache')
const axios = require('axios');
const express = require('express');
const path = require('path');
// Asynchronous
const { randomBytes } = require('crypto');


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
    .then((oauth2_token) => {
      let wallet = {
        id: randomBytes(32)
      };
      cache.set(wallet, {isAuthenticated:false});
      cache.set('oauth2_token', oauth2_token)
      res.redirect(`/?token=${oauth2_token}`);
    })
    .catch((err) => res.status(500).json({ err: err.message }));
});

function validateToken(req,res,next) {
  let oauth2_token = cache.get("oauth2_token"); // "value"
  console.log("oauth2_token: ",oauth2_token);
  let config = {
    method: 'get',
    url: 'https://api.github.com/user',
    headers: { 
      'Authorization': 'Bearer ' + oauth2_token,
      'Content-Type': 'application/json', 
      'accept': 'application/json'
    }
  };
  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      if (typeof response.status === 200) {
        let {id,login} = response.data;

      }
      next()
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).send('Something broke!')
    });
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



// At least one of 'max', 'ttl', or 'maxSize' is required, to prevent
// unsafe unbounded storage.
// In most cases, it's best to specify a max for performance, so all
// the required memory allocation is done up-front.
const options = {
  max: 500, 
  maxSize: 5000,
  sizeCalculation: (value, key) => {
    return 1
  },
  // function to call when the item is removed from the cache
  dispose: (value, key) => {
    console.log("cache entry cleaned")
  },
  ttl: 1000 * 60 * 5,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
};
const cache = new LRU(options);






app.listen(3000);
console.log('App listening on port 3000');
