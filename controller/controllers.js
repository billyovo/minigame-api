import {winner, news} from "../utils/database.js";
import fetch from 'node-fetch';
import {redirect_uri, guild_id, acceptable_roles} from '../config.js';
import jwt from 'jsonwebtoken';
import {ObjectId} from "mongodb";
import { isValidNews, isValidObjectID } from "../utils/validators.js";
import { getEventNameOrID } from "../utils/namingUtils.js";
import {eventsDateMap} from '../utils/getEventSchedule.js'
import { resolve } from 'path';
import { makeBanner } from "../utils/image.js";

function createCountPipeline(filters, limit, offset){
    return [
  {
    '$match': filters
  }, {
    '$group': {
      '_id': {
        'name': '$name', 
        'UUID': '$UUID',
      }, 
      'total': {
        '$sum': 1
      }
    }
  }, {
    '$sort': {
      'total': -1
    }
  }, {
    '$facet': {
      'total': [
        {
          '$count': 'count'
        }
      ], 
      'rows': [
          {
              '$skip': offset
          },
        {
          '$limit': limit
        }, {
          '$project': {
            '_id': 0, 
            'name': '$_id.name', 
            'UUID': '$_id.UUID', 
            'total': '$total'
          }
        }
      ]
    }
  }, {
    '$addFields': {
      'total': {
        '$arrayElemAt': [
          '$total.count', 0
        ]
      }
    }
  }
]
}
function createRecordPipeline(filters, limit){
    return [
   {
    '$sort': {
      '_id': -1
    }
  },
  {
    '$match': filters
  },
  {
    '$facet': {
      'total': [
        {
          '$count': 'count'
        }
      ], 
      'rows': [

        {
          '$limit': limit
        }
          
      ]
    }
  }, {
    '$addFields': {
      'total': {
        '$arrayElemAt': [
          '$total.count', 0
        ]
      }
    }
  }, {
    '$unset': 'count'
  }
]};

function createNewsListPipeline(filters, limit){
  return [
    {
      '$match': filters
    }, {
      '$facet': {
        'total': [
          {
            '$count': 'count'
          }
        ], 
        'rows': [
          {
            '$limit': limit,
          },
          {
            '$sort': {
              'publish_date': -1
            }
          },
          {
            '$project': {
              '_id': 1, 
              'title': 1,
              'publish_date': 1
            }
          }
        ]
      }
    }, {
      '$addFields': {
        'total': {
          '$arrayElemAt': [
            '$total.count', 0
          ]
        }
      }
    }
  ]
}
export async function getRecordPipelineResult(req, res){
    const pipeline = createRecordPipeline(res.locals.filters, res.locals.limit);
    const data = await winner.aggregate(pipeline).toArray();
    res.send(data[0]);
}
export async function getCountPipelineResult(req, res){
    const pipeline = createCountPipeline(res.locals.filters, res.locals.limit, res.locals.offset);
    const data = await winner.aggregate(pipeline).toArray();
    res.send(data[0]);
}

export async function getNewsList(req, res){
  const pipeline = createNewsListPipeline(res.locals.filters, res.locals.limit);
  const data = await news.aggregate(pipeline).toArray();
  res.send(data[0]);
}

export async function getNews(req, res){
  const data = await news.findOne(res.locals.filters);
  if(!data){ 
    res.status(404).send();
    return;
  }
  res.send(data);
}

async function fetchAccessToken(code){
  try{
      const res = await fetch("https://discord.com/api/oauth2/token",{
          method: "POST",
          headers: {
              "Content-Type": "application/x-www-form-urlencoded"
          },
          body: `client_id=${process.env.client_id}&client_secret=${process.env.client_secret}&grant_type=authorization_code&scope=identify%20guilds&redirect_uri=${redirect_uri}&code=${code}`
      })
      if(res.status === 400){ 
          return {
            token: null,
            response: 400,
            reason: "Invalid code"
          };
      }
      if(!res.ok) throw new Error();
      const data = await res.json();
      return {token: data.access_token};
  }
  catch(error){
    console.error(error);
      return {
        token: null,
        response: 500,
        reason: "Discord API error"
      }
  }
}

async function fetchRoleInServer(token){
  try{
    const res = await fetch(`https://discord.com/api/users/@me/guilds/${guild_id}/member`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    if(!res.ok) throw new Error();
    const data = await res.json();
    return { 
      roles: data.roles,
      user: {
        username: `${data.user.username}#${data.user.discriminator}`,
        userID: data.user.id,
        avatar: `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`
      },

    }
  }
  catch(error){
    return {
      response: 500,
      reason: "Discord API error"
    }
  }
}
export async function getDiscordToken(req, res){
  const accessResponse = await fetchAccessToken(req.body.code);
  if(!accessResponse.token){
    res.status(accessResponse.response).send(accessResponse.reason);
    return;
  }
  const token = accessResponse.token;
  const rolesResponse = await fetchRoleInServer(token);
  if(!rolesResponse.roles){
    res.status(rolesResponse.response).send(rolesResponse.reason);
    return;
  }
  if(rolesResponse.roles.filter(role => acceptable_roles.includes(role)).length === 0){
    res.status(401).send("You are not authorised!");
    return;
  }
  res.status(200).send({
    user: rolesResponse.user,
    token: jwt.sign(
      {data: rolesResponse.user, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), }, 
      process.env.private_key)
  });
}

export async function deleteNews(req, res){
  const data = await news.deleteOne({_id: new ObjectId(req.params._id)});
  res.status(200).send(data);
}


export async function updateNews(req, res){
  if(isValidNews(req.body)){
    res.status(400).send("Invalid Body");
    return;
  }

  const data = await news.updateOne({_id: new ObjectId(req.params._id)}, {$set: req.body});
  res.status(200).send(data);
}

export async function addNews(req, res){
  if(isValidNews(req.body)){
    res.status(400).send("Invalid Body");
    return;
  }
  const data = await news.insertOne(req.body);
  res.status(200).send(data);
}

export async function sendEvents(req, res){
  const event = await import("../assets/event.json", {assert: { type: "json" }});
  res.send(event.default);
}

function getBanlistPipeline(server){
  return [
{
  '$match': {
    'server': server
  }
}, {
  '$sort': {
    'date': -1
  }
}, {
  '$group': {
    '_id': {
      'event': '$event'
    }, 
    'name': {
      '$first': '$name'
    }
  }
}, {
  '$project': {
    'event': '$_id.event', 
    'name': '$name'
  }
}, {
  '$unset': '_id'
}
]
}
export async function getBanList(req, res){
    const survivalResult = await winner.aggregate(getBanlistPipeline("生存")).toArray();
    const skyblockResult = await winner.aggregate(getBanlistPipeline("空島")).toArray();
    
    let result = {survival: {}, skyblock: {}};
    for(let i = 0; i < survivalResult.length; i++){
        result.survival[getEventNameOrID(survivalResult[i].event)] = survivalResult[i].name;
        result.skyblock[getEventNameOrID(skyblockResult[i].event)] = skyblockResult[i].name;
    }
    res.status(200).send(result);
}

export function getEventSchedule(req, res){
  res.status(200).send(eventsDateMap);
}

export function getNextEventImage(req, res){
    res.sendFile(resolve(`./assets/banner-${eventsDateMap.nearest.date.toFormat('yyyy-MM-dd')}.png`));
}