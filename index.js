const db = require("./Helper/db");
const eventHelper = require("./Helper/eventHelper");
const {schemaCount, schemaRecord} = require("./assets/scheme");
const app = require('fastify')({
  logger: {
    level: 'error',
    file: './error-log.txt'
  }
});
app.register(require('fastify-rate-limit'), {
  max: 900,
  timeWindow: '30 minute'
});
app.register(require('fastify-cors'));
app.register(require('fastify-helmet'));


app.addHook('onRequest', (req, res, done) => {
  if(req.query.limit && req.query.limit >100){
   	res.status(403).send("Request too large!")
   }
   if(!(req.params.server === 'survival' || req.params.server === 'skyblock' || req.params.server === 'all') && req.params.server){
    res.status(400).send("server does not exist!");
   }
 else{
 	done();
  }
})
console.log("Running in: "+process.env.NODE_ENV+" mode");

async function handleReq(req, res, query, parameters = []){
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.page) * limit || 0;
    const params = [...parameters,limit, offset];
    try{
        const result = await db.query(query,params);   
        res.status(result[0][0].length === 0 ? 204 : 200).send(JSON.stringify({rows: result[0][0], ...result[0][1][0]}));
    }
    catch(error){
        app.log.error(error, "Error occured");
        res.code(500).send();
    }
}
app.get('/', function(req,res){
    res.status(200).send({status: "OK", uptime: process.uptime(), mode: process.env.NODE_ENV});
})

app.get('/events', function(req,res){
  res.status(200).send(JSON.stringify(require("./assets/event.json")))
})

app.get('/news', schemaCount, function(req,res){
  handleReq(req, res, 'CALL get_news_List(?,?)');
})

app.get('/news/:id', schemaCount, function(req,res){
  handleReq(req, res, 'CALL get_news(?)', [req.params.id]);
})

app.get('/count/:server', schemaCount, function(req,res){
    handleReq(req, res, 'CALL count_server(?, ?, ?)', [req.params.server]);
})

app.get('/count/:server/:event', schemaCount, function(req,res){
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL count_event(?,?,?,?)', [req.params.server, event]);
})

app.get('/count/:server/:event/:name', schemaCount, function(req,res){
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL count_name(?,?,?,?,?)', [req.params.server, event, req.params.name]);
})

app.get('/record/:server', schemaRecord, function(req,res){
    handleReq(req, res, 'CALL record_server(?, ?, ?)', [req.params.server]);
})


app.get('/record/:server/:event', schemaRecord, function(req,res){
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL record_event(?, ?, ?, ?)', [req.params.server, event]);
})

app.get('/record/:server/:event/:name', schemaRecord, function(req,res){   
    const event = eventHelper.findEventID(req.params.event);
    handleReq(req, res, 'CALL record_name(?, ?, ?, ?, ?)', [req.params.server, event, req.params.name]);
})

app.listen(28001, '0.0.0.0', function (error, address) {
  if (error) {
    console.error(error);
    process.exit(1)
  }
  console.log(`Server working on ${address}`);
  console.log("done!");
})
