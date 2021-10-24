const db = require("./Helper/db");
const eventHelper = require("./Helper/eventHelper");
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
 else{
 	done();
  }
})
console.log("Running in: "+process.env.NODE_ENV+" mode");
const schemaCount = {
    schema: {
  		response: {
    		'200': {
      			type: 'object',
     			 properties: {
        			total: { type: 'integer' },
        			rows: { 
           				type: 'array',
            			items: { 
                			type: 'object',
                			properties: {
                 				name: {type: 'string'},
                    			uuid: {type: 'string'},
                    			total: {type: 'integer'}
                    		}
            			}
                   	}
      			}
    		}
  		}
    }
}

const schemaRecord = {
    schema: {
  		response: {
    		'200': {
      			type: 'object',
     			 properties: {
        			total: { type: 'integer' },
        			rows: { 
           				type: 'array',
            			items: { 
                			type: 'object',
                			properties: {
                 				name: {type: 'string'},
                    			uuid: {type: 'string'},
                                event: {type: 'string'},
                    			date: {type: 'string'},
                                server: {type: 'string'}
                    		}
            			}
                   	}
      			}
    		}
  		}
    }
}

async function handleReq(req, res, query, totalQuery, parameters = [], totalParameters = []){
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.page) * limit || 0;
    const params = [...parameters,limit, offset];
    try{
        const [rows, totals] = await Promise.all([db.query(query,params), db.query(totalQuery, totalParameters)]);     
        res.status(200).send({total: totals[0][0].total, rows: rows[0]});
    }
    catch(error){
        app.log.error(error, "Error occured");
        res.code(500).send();
    }
}
app.get('/', function(req,res){
    res.status(200).send({status: "OK", uptime: process.uptime(), mode: process.env.NODE_ENV});
})
app.get('/count/:server', schemaCount, function(req,res){
    if(req.params.server === 'survival' || req.params.server === 'skyblock'){
       const query = "SELECT name, uuid, COUNT(*) AS total FROM ?? INNER JOIN player ON player.uuid = ??.player GROUP BY name ORDER BY total DESC LIMIT ? OFFSET ?";
       const totalQuery = "SELECT COUNT(player) AS total FROM (SELECT * FROM ?? GROUP BY player) dt";
        
        handleReq(req,res, query, totalQuery, [req.params.server, req.params.server], [req.params.server]);
    }
    else{
        const query = "SELECT name,uuid, COUNT(uuid) AS total FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid GROUP BY player.name ORDER BY total DESC LIMIT ? OFFSET ?;";
        const totalQuery = "SELECT COUNT(uuid) AS total FROM player;";
        
        handleReq(req,res, query, totalQuery);
    }
})

app.get('/count/:server/:event', schemaCount, function(req,res){
    
    if(req.params.server === 'survival' || req.params.server === 'skyblock'){
        const query = "SELECT name, uuid, COUNT(*) AS total FROM ?? INNER JOIN player ON player.uuid = ??.player WHERE event LIKE ? GROUP BY name ORDER BY total DESC LIMIT ? OFFSET ?";
        const totalQuery = "SELECT COUNT(player) AS total FROM (SELECT player FROM ?? WHERE event LIKE ? GROUP BY player) dt"
		const params = eventHelper.findEventID(req.params.event)+"%";
        handleReq(req,res, query, totalQuery, [req.params.server, req.params.server, params], [req.params.server, params]);
        
    }
    else{
        const query = "SELECT name,uuid, COUNT(uuid) AS total FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid WHERE event LIKE ? GROUP BY player.name ORDER BY total DESC LIMIT ? OFFSET ?";   
        const totalQuery = "WITH temp AS (SELECT player, event FROM survival UNION SELECT player, event FROM skyblock) SELECT COUNT(*) AS total FROM (SELECT * FROM temp WHERE event LIKE ? GROUP BY PLAYER) dt";
        const params = [eventHelper.findEventID(req.params.event)+"%"];
        handleReq(req,res, query, totalQuery, params, params);

    }
})

app.get('/count/:server/:event/:name', schemaCount, function(req,res){

    if(req.params.server === 'survival' || req.params.server === 'skyblock'){
    	const query = "SELECT name, uuid, COUNT(*) AS total FROM ?? INNER JOIN player ON player.uuid = ??.player WHERE event LIKE ? AND name LIKE ? GROUP BY name ORDER BY total DESC LIMIT ? OFFSET ?";       
        const totalQuery = "WITH temp AS (SELECT name, event FROM ?? INNER JOIN player ON player.uuid = ??.player) SELECT COUNT(*) AS total FROM (SELECT * FROM temp WHERE event LIKE ? AND name LIKE ? GROUP BY name) dt";
        const params = [req.params.server,req.params.server, eventHelper.findEventID(req.params.event)+"%", "%"+req.params.name+"%"];
        
        handleReq(req,res, query, totalQuery, params, params);
    }
    else{
        const query = "SELECT name,uuid, COUNT(uuid) AS total FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid WHERE event LIKE ? AND player.name LIKE ? GROUP BY name ORDER BY total DESC LIMIT ? OFFSET ?";      
        const totalQuery = "WITH temp AS (SELECT player, event FROM survival UNION ALL SELECT player, event FROM skyblock) SELECT COUNT(*) AS total FROM (SELECT name, event FROM temp INNER JOIN player ON temp.player = player.uuid WHERE event LIKE ? AND name LIKE ? GROUP BY name ) dt";
        const params = [eventHelper.findEventID(req.params.event)+"%", "%"+req.params.name+"%"];
        
         handleReq(req,res, query, totalQuery, params, params);
    }

})
//page
//limit
app.get('/record/:server', schemaRecord, function(req,res){

    if(req.params.server === 'survival' || req.params.server === 'skyblock'){
        const query = "SELECT name,uuid,event,date, ? AS server FROM ?? INNER JOIN player ON player.uuid = ??.player ORDER BY date DESC LIMIT ? OFFSET ?";
		const totalQuery = `SELECT COUNT(*) AS total FROM ??`;
        
        handleReq(req,res, query, totalQuery, [req.params.server==="survival" ? "生存" : "空島", req.params.server, req.params.server], [req.params.server]);
    }
    else{
        const query = 'SELECT name,uuid, event, date, server FROM (SELECT *, "生存" AS server FROM survival UNION ALL SELECT *, "空島" AS server FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid ORDER BY date DESC LIMIT ? OFFSET ?';
        const totalQuery = 'SELECT COUNT(*) AS total FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) dt';
        
        handleReq(req,res, query, totalQuery);
    }
})


app.get('/record/:server/:event', schemaRecord, function(req,res){
    if(req.params.server === 'survival' || req.params.server === 'skyblock'){
        const query = "SELECT name,uuid,event,date, ? AS server FROM ?? INNER JOIN player ON player.uuid = ??.player WHERE event LIKE ? ORDER BY date DESC LIMIT ? OFFSET ?";
        const totalQuery = "SELECT COUNT(*) AS total FROM ?? WHERE event LIKE ?";
        const params = eventHelper.findEventID(req.params.event)+"%";
     
        handleReq(req,res, query, totalQuery, [req.params.server==="survival" ? "生存" : "空島", req.params.server, req.params.server, params], [req.params.server, params]);
    }
    else{
        const query = 'SELECT name,uuid, event, date, server FROM (SELECT *, "生存" AS server FROM survival UNION ALL SELECT *, "空島" AS server FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid WHERE event LIKE ? ORDER BY date DESC LIMIT ? OFFSET ?';
        const totalQuery = "SELECT COUNT(*) AS total FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock WHERE event LIKE ?) dt";    
        const params = [eventHelper.findEventID(req.params.event)+"%"];
        
        handleReq(req,res, query, totalQuery, params, params);
    }
})

app.get('/record/:server/:event/:name', schemaRecord, function(req,res){   
    if(req.params.server === 'survival' || req.params.server === 'skyblock'){
        const query = "SELECT name, uuid,event,date, server FROM (SELECT *, ? AS server FROM ?? INNER JOIN player ON player.uuid = ??.player) temp WHERE event LIKE ? AND name LIKE ? ORDER BY date DESC LIMIT ? OFFSET ?";
        const totalQuery = "SELECT COUNT(*) AS total FROM (SELECT * FROM ?? INNER JOIN player ON player.uuid = ??.player) temp WHERE event LIKE ? AND name LIKE ?";
        const params = [req.params.server, req.params.server, eventHelper.findEventID(req.params.event)+"%", "%"+req.params.name+"%"];
        
       handleReq(req,res, query, totalQuery, [req.params.server==="survival" ? "生存" : "空島", ...params], params);        
    }
    else{
        const query = 'SELECT name,uuid,event,date, server FROM (SELECT *, "生存" AS server FROM survival UNION ALL SELECT *, "空島" AS server FROM skyblock) temp INNER JOIN player ON player.uuid = temp.player WHERE event LIKE ? AND name LIKE ? ORDER BY date DESC LIMIT ? OFFSET ?';
        const totalQuery = "SELECT COUNT(*) AS total FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) temp INNER JOIN player ON player.uuid = temp.player WHERE event LIKE ? AND name LIKE ?;"
        const params = [eventHelper.findEventID(req.params.event)+"%", "%"+req.params.name+"%"];
        
        handleReq(req,res, query, totalQuery, params, params);
    }
})

app.listen(28001, '0.0.0.0', function (error, address) {
  if (error) {
    console.error(error);
    process.exit(1)
  }
  console.log(`Server working on ${address}`);
  console.log("done!");
})
