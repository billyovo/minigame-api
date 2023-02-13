import {validateRequest, createRecordFilter, createFilter, createNewsListFilter, createNewsFilter} from "./middleware/middlewares.js";
import {getRecordPipelineResult, getCountPipelineResult, getNewsList, getNews} from "./controller/controllers.js";
import express from "express";
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

app.get('/record/:server', createRecordFilter, getRecordPipelineResult);
app.get('/record/:server/:event', createRecordFilter, getRecordPipelineResult);
app.get('/record/:server/:event/:player', createRecordFilter, getRecordPipelineResult);

app.get('/count/:server', createFilter, getCountPipelineResult);
app.get('/count/:server/:event', createFilter, getCountPipelineResult);
app.get('/count/:server/:event/:player', createFilter, getCountPipelineResult);

app.get('/news', createNewsListFilter, getNewsList);
app.get('/news/:_id', createNewsFilter, getNews);

app.listen(28001, '0.0.0.0',()=> {
  console.log("done!");
})
