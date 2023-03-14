import {getEventName, getServerName} from "../utils/namingUtils.js";
import {ObjectId} from "mongodb";
import jwt from 'jsonwebtoken';

/*
    validate if request is valid
    1. less than 100 records
    2. more than 0 records
    3. valid objectID for before, after or _id
    4. valid event name
    5. valid player name

    @typedef {object} showRequestQuery
    @property {number} limit - number of records to show
*/
export function validateRequest(req, res, done){
    if(req.query.limit && req.query.limit >100){
     	res.status(403).send("Request too large!")
      return;
     }
    if(req.query.limit && req.query.limit <= 0){
     	res.status(403).send("Request too small!")
      return;
    }
    const objectIDRegex = /^[a-f\d]{24}$/i;
    if(req.params.event && !getEventName(req.params.event)){
        res.status(400).send("Invalid Event!")
        return;
    }

    if(req.query.before && !req.query.before.match(objectIDRegex)){
        res.status(400).send("Invalid Before ID!")
        return; 
    }
    if(req.query.after && !req.query.after.match(objectIDRegex)){
        res.status(400).send("Invalid After ID!")
        return;
    } 

    if(req.params._id && !req.params._id.match(objectIDRegex)){
        res.status(400).send("Invalid ID!")
        return;
    }

    const playerNameRegex = /^[a-zA-Z0-9_]{2,16}$/;
    if(req.params.player && !req.params.player.match(playerNameRegex)){
        res.status(400).send("Invalid Player Name!")
        return;
    }

    done();
}
/*
    handle request for /record
    @typedef {object} recordRequestQuery
    @property {string} before - get records before this id
    @property {string} after - get records after this id
    @property {string} dateBefore - get records before this date
    @property {number} limit - number of records to show

    @typedef {object} recordRequestParams
    @property {string} server - get records from this server
    @property {string} event - get records from this event
    @property {string} player - get records from this player

    @typedef {object} recordResponse
    @property {number} total - total number of records
    @property {object[]} rows - array of records
    @property {string} rows._id - id of record
    @property {string} rows.server - server of record
    @property {string} rows.event - event of record
    @property {string} rows.name - name of record
    @property {string} rows.UUID - UUID of record
    @property {string} rows.date - date of record
*/
export function createRecordFilter(req, res, next){
	let filters = {};
    if(req.query.before){
        filters._id = {
            "$lt": new ObjectId(req.query.before)
        }
    }
    if(req.query.after){
        filters._id = {
            "$gt": new ObjectId(req.query.after)
        }
    }
    const serverName = getServerName(req.params.server);
    if(serverName !== "all") filters.server = serverName;
    
    const eventName = getEventName(req.params.event);
    if(eventName) filters.event = eventName;
    if(req.query.dateBefore) filters.date = {"$lte": req.query.dateBefore};
    if(req.params.player) filters.name = req.params.player;
    
    res.locals.filters = filters;
    res.locals.limit = parseInt(req.query.limit) || 50;
    next();
}

/*
    handle request for /count
    @typedef {object} countRequestQuery
    @property {string} dateBefore - get records before this date
    @property {number} limit - number of records to show
    @property {number} page - page number

    @typedef {object} countRequestParams
    @property {string} server - get records from this server
    @property {string} event - get records from this event
    @property {string} player - get records from this player

    @typedef {object} countResponse
    @property {number} total - total number of records
    @property {object[]} rows - array of records
    @property {string} rows.name - name of record
    @property {string} rows.UUID - UUID of record
    @property {number} rows.total - total number of records
*/
export function createFilter(req, res, next){
	let filters = {};
    const serverName = getServerName(req.params.server);
    if(serverName !== "all") filters.server = serverName;
    
    const eventName = getEventName(req.params.event);
    if(eventName) filters.event = eventName;
    
    if(req.params.player) filters.name = req.params.player;
    if(req.query.dateBefore) filters.date = {"$lte": req.query.dateBefore};
    
    res.locals.filters = filters;
    res.locals.limit = parseInt(req.query.limit) || 50;
    res.locals.offset = (parseInt(req.query.page)*res.locals.limit) || 0;
    next();
}

/*
    handle request for /news
    @typedef {object} newsRequestQuery
    @property {string} before - get records before this id
    @property {string} after - get records after this id
    @property {number} limit - number of records to show

    @typedef {object} newsResponse
    @property {number} total - total number of news
    @property {object[]} rows - array of news
    @property {string} rows._id - id of news
    @property {string} rows.title - title of news
    @property {string} rows.content - content of news
    @property {string} rows.publish_date - publish date of news
    @property {string[]} rows.image - image of the news

*/

export function createNewsListFilter(req,res,next){
    let filters = {
        "publish_date":{
            "$lte": new Date().toISOString().substring(0,10),
        }
    };
    if(req.query.before){
        filters._id = {
            "$lt": new ObjectId(req.query.before)
        }
    }
    if(req.query.after){
        filters._id = {
            "$gt": new ObjectId(req.query.after)
        }
    }
    
    res.locals.filters = filters;
    res.locals.limit = parseInt(req.query.limit) || 50;
    next();   
}

/*
    handle request for /news/:_id
    @typedef {object} newsRequestParams
    @property {string} _id - get records from this id

    @typedef {object} newsResponse
    @property {number} total - total number of news
    @property {object[]} rows - array of news
    @property {string} rows._id - id of news
    @property {string} rows.title - title of news
    @property {string} rows.content - content of news
    @property {string} rows.publish_date - publish date of news
    @property {string[]} rows.image - image of the news
    
*/
export function createNewsFilter(req, res, next){
    let filters = {
        "_id": new ObjectId(req.params._id)
    }

    res.locals.filters = filters;
    next();
}

export function verifyToken(req, res, next){
    const auth = req.headers.authorization;
    const bearer = auth?.split(' ');
    if(!auth || bearer?.length !== 2) res.status(401).send("Invalid token!");
    const bearerToken = bearer[1];

    if(jwt.verify(bearerToken, process.env.private_key)){
        next();
    }
    else{
        res.status(401).send("Invalid token!");
    }

}
