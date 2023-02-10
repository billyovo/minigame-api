import {winner} from "../utils/database.js";

function createCountPipeline(filters, limit, offset, before){
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
      'count': [
        {
          '$count': 'count'
        }
      ], 
      'rows': [
          {
              '$skip': offset
          },
        {
          '$limit': 10
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
      'count': {
        '$arrayElemAt': [
          '$count.count', 0
        ]
      }
    }
  }
]
}
function createRecordPipeline(filters, limit, before){
    return [
   {
    '$sort': {
      'date': -1, 
      '_id': -1
    }
  },
  {
    '$match': filters
  },
  {
    '$facet': {
      'count': [
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
          '$count.count', 0
        ]
      }
    }
  }, {
    '$unset': 'count'
  }
]};
    
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
