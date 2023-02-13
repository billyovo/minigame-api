import {getEventName, getServerName} from "../utils/namingUtils.js";
import {ObjectId} from "mongodb";

export function validateRequest(req, res, done){
  if(req.query.limit && req.query.limit >100){
   	res.status(403).send("Request too large!")
    return;
   }
  if(req.query.limit && req.query.limit <= 0){
   	res.status(403).send("Request too small!")
    return;
  }
    done();
}

export function createRecordFilter(req, res, next){
	let filters = {};
    if(req.query._id){
        filters._id =  req.query.prev ? {"$gt": new ObjectId(req.query._id)} : {"$lt": new ObjectId(req.query._id)};
    } 
    const serverName = getServerName(req.params.server);
    if(serverName !== "all") filters.server = serverName;
    
    const eventName = getEventName(req.params.event);
    if(eventName) filters.event = eventName;
    if(req.query.before) filters.date = {"$lte": req.query.before};
    if(req.params.player) filters.name = req.params.player;
    
    res.locals.filters = filters;
    res.locals.limit = parseInt(req.query.limit) || 10;
    next();
}

export function createFilter(req, res, next){
	let filters = {};
    const serverName = getServerName(req.params.server);
    if(serverName !== "all") filters.server = serverName;
    
    const eventName = getEventName(req.params.event);
    if(eventName) filters.event = eventName;
    
    if(req.params.player) filters.name = req.params.player;
    if(req.query.before) filters.date = {"$lte": req.query.before};
    
    res.locals.filters = filters;
    res.locals.limit = parseInt(req.query.limit) || 10;
    res.locals.offset = (parseInt(req.query.page)*res.locals.limit) || 0;
    next();
}

export function createNewsListFilter(req,res,next){
    let filters = {
        "publish_date":{
            "$lte": new Date().toLocaleDateString('en-CA'),
        }
    };
    if(req.query._id){
        filters._id = {
            "$lt": new ObjectId(req.query._id)
        }
    }
    
    res.locals.filters = filters;
    res.locals.limit = parseInt(req.query.limit) || 20;
    next();   
}

export function createNewsFilter(req, res, next){
    let filters = {
        "_id": new ObjectId(req.params._id)
    }

    res.locals.filters = filters;
    next();
}