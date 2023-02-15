import {winner, news} from "../utils/database.js";

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
  res.send(data);
}