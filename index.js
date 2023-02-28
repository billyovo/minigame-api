import {validateRequest, createRecordFilter, createFilter, createNewsListFilter, createNewsFilter} from "./middleware/middlewares.js";
import {getRecordPipelineResult, getCountPipelineResult, getNewsList, getNews} from "./controller/controllers.js";
import express from "express";
import * as swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger.json' assert {type: 'json'};
const app = express();
app.use(express.json());

import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 450, 
	standardHeaders: true, 
	legacyHeaders: false, 
})
app.use(limiter)

import cors from 'cors';
app.use(cors());

import helmet from "helmet";
app.use(helmet());

app.all('*', validateRequest);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
/*
	@openapi
	components:
	  schemas:
	    Record:
			type: object
			properties:
				_id:
					type: string
					description: id of the record
				server:
					type: string
					description: server of the record
				event:
					type: string
					description: event of the record
				name:
					type: string
					description: name of the record
				UUID:
					type: string
					description: UUID of the record
				date:
					type: string
					description: date of the record
*/
app.get('/record/:server', createRecordFilter, getRecordPipelineResult);
app.get('/record/:server/:event', createRecordFilter, getRecordPipelineResult);
app.get('/record/:server/:event/:player', createRecordFilter, getRecordPipelineResult);

/*
	@openapi
	components:
	  schemas:
	    Count:
			type: object
			properties:
				total:
					type: number
					description: total number of records
				rows:
					type: array
					description: array of records
					items:
						type: object
						properties:
							name:
								type: string
								description: name of the record
							UUID:
								type: string
								description: UUID of the record
							total:
								type: number
								description: total number of records

*/
app.get('/count/:server', createFilter, getCountPipelineResult);
app.get('/count/:server/:event', createFilter, getCountPipelineResult);
app.get('/count/:server/:event/:player', createFilter, getCountPipelineResult);

/*
	@openapi
	components:
	  schemas:
	    NewsList:
			type: object
			properties:
				total:
					type: number
					description: total number of news
				rows:
					type: array
					description: array of news
					items:
						type: object
						properties:
							_id:
								type: string
								description: id of the news 
							title:
								type: string
								description: title of the news
							content:
								type: string
								description: content of the news
							publish_date:
								type: string
								description: publish date of the news
							image:
								type: array
								description: image of the news
								items:
									type: string
									description: image url

*/
app.get('/news', createNewsListFilter, getNewsList);

/*
	@openapi
	components:
	  schemas:
	    News:
			type: object
			properties:
				_id:
					type: string
					description: id of the news
				title:
					type: string
					description: title of the news
				content:
					type: string
					description: content of the news
				publish_date:
					type: string
					description: publish date of the news
				image:
					type: array
					description: image of the news
					items:
						type: string
						description: image url
*/
app.get('/news/:_id', createNewsFilter, getNews);

app.listen(28001, '0.0.0.0',()=> {
  console.log("done!");
})
