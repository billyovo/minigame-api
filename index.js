const db = require("./Helper/db");
const eventHelper = require("./Helper/eventHelper");
require('dotenv').config();

const { request } = require('undici');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();

app.use(express.json());

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 450, 
	standardHeaders: true, 
	legacyHeaders: false, 
})
app.use(limiter)

const cors = require('cors')
app.use(cors());

const helmet = require("helmet");
app.use(helmet());


const morgan = require('morgan')
const fs = require('fs')
const errorLogStream = fs.createWriteStream('./error-log.txt', { flags: 'a' });
app.use(morgan('combined', { 
  stream: errorLogStream, 
  skip: function (req, res) { 
    return res.statusCode < 400 
  }
}))
const accessLogStream = fs.createWriteStream('./access-log.txt', { flags: 'a' });
app.use(morgan('combined', { 
  stream: accessLogStream, 
  skip: function (req, res) { 
    return req.method === 'GET';
  }
}))


app.all('*', (req, res, done) => {
  if(req.query.limit && req.query.limit >100){
   	res.status(403).send("Request too large!")
    return;
   }

   if(!(req.params.server === 'survival' || req.params.server === 'skyblock' || req.params.server === 'all') && req.params.server){
    res.status(400).send("server does not exist!");
    return;
   }

   if(req.params.event && !eventHelper.findEventID(req.params.event)){
    res.status(400).send("Event does not exist!")
    return;
  }
 	done();
})
console.log("Running in: "+process.env.NODE_ENV+" mode");

async function handleReq(req, res, query, parameters = []){
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.page) * limit || 0;
    const params = [...parameters,limit, offset];
    try{
        const result = await db.query(query,params);   
        if(result[0][0].length === 0){
          res.status(204).send();
          return;
        }
        res.status(200).send(JSON.stringify({rows: result[0][0], ...result[0][1][0]}));
    }
    catch(error){
        console.log(error);
        res.status(500).send();
    }
}
app.get('/', function(req,res){
    res.status(200).send({status: "OK", uptime: process.uptime(), mode: process.env.NODE_ENV});
})

app.get('/events', function(req,res){
  res.status(200).send(JSON.stringify(require("./assets/event.json")))
})

app.get('/news', function(req,res){
  handleReq(req, res, 'CALL get_news_List(?,?)');
})

app.get('/news/:id',function(req,res){
  if(!parseInt(req.params.id)){
    res.status(400).send();
    return;
  }
  db.query('CALL get_news(?)', [parseInt(req.params.id)])
  .then((result)=>{
    if(result[0][0][0]){
      res.status(200).send(JSON.stringify(result[0][0][0]));
    }
    else{
      res.status(204).send();
    }
    
  })
})

app.get('/count/:server', function(req,res){
    handleReq(req, res, 'CALL count_server(?, ?, ?)', [req.params.server]);
})

app.get('/count/:server/:event', function(req,res){
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL count_event(?,?,?,?)', [req.params.server, event]);
})

app.get('/count/:server/:event/:name', function(req,res){
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL count_name(?,?,?,?,?)', [req.params.server, event, req.params.name]);
})

app.get('/record/:server', function(req,res){
    handleReq(req, res, 'CALL record_server(?, ?, ?)', [req.params.server]);
})


app.get('/record/:server/:event', function(req,res){
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL record_event(?, ?, ?, ?)', [req.params.server, event]);
})

app.get('/record/:server/:event/:name', function(req,res){   
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL record_name(?, ?, ?, ?, ?)', [req.params.server, event, req.params.name]);
})

app.post('/auth', async function(req,res){
  const code = req.body?.code;

  const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
        body: new URLSearchParams({
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					code: code,
					grant_type: 'authorization_code',
					redirect_uri: process.env.REDIRECT_URI,
					scope: 'identify',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
  const response = await tokenResponseData.body.json();
  if(!response?.access_token){
    res.status(401).send();
    return;
  }

  const accountInfo = await request(process.env.INFO_URL,{
    method: 'GET',
    headers: {
      'Authorization': `${response?.token_type} ${response?.access_token}`
    }
  })
  const info = await accountInfo.body.json();
  if(!info?.roles){
    res.status(401).send();
    return;
  }
  const {editable_roles} = require("./config.json");
  const common_roles = editable_roles.filter(value => info.roles.includes(value));
  if(common_roles.length === 0){
    res.status(401).send();
    return;
  }
  else{
    res.status(200).send(JSON.stringify({
      token: jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
      }, process.env.SECRET),
      avatarurl: `https://cdn.discordapp.com/avatars/${info.user.id}/${info.user.avatar}`,
      name: info.user.username+"#"+info.user.discriminator
    }))
  }
  
})

const authMiddleware = (req, res, next) => {
  if(jwt.verify(req.headers?.authorization?.split(" ")[1], process.env.SECRET)){
    next();
    return;
  }
  else{
    res.status(401).send();
  }
  
}
app.delete('/news/edit/:id', authMiddleware, async function(req,res){
  try{
    await db.query('CALL delete_news(?)',[req.params.id]);
    res.status(200).send();
  }
  catch(error){
    res.status(500).send(error.message);
  }
})

app.post('/news/edit/new', authMiddleware, async function(req,res){
  try{
    await db.query('CALL create_news(?,?,?,?)',[req.body.title, req.body.content, req.body.publish_date, req.body.image]);
    res.status(200).send();
  }
  catch(error){
    res.status(500).send(error.message);
  }
})

app.patch('/news/edit/:id', authMiddleware, async function(req,res){
  try{
    await db.query('CALL update_news(?,?,?,?,?)',[req.body.title, req.body.content, req.body.publish_date, req.body.image, req.params.id]);
    res.status(200).send();
  }
  catch(error){
    res.status(500).send(error.message);
  }
})

app.listen(28001, '0.0.0.0',()=> {
  console.log("done!");
})
