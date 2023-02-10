import {validateRequest, createRecordFilter, createFilter} from "./middleware/middlewares.js";
import {getRecordPipelineResult, getCountPipelineResult} from "./controller/controllers.js";
import express from "express";
const app = express();

app.all('*', validateRequest);

app.get('/record/:server', createRecordFilter, getRecordPipelineResult);
app.get('/record/:server/:event', createRecordFilter, getRecordPipelineResult);
app.get('/record/:server/:event/:player', createRecordFilter, getRecordPipelineResult);

app.get('/count/:server', createFilter, getCountPipelineResult);
app.get('/count/:server/:event', createFilter, getCountPipelineResult);
app.get('/count/:server/:event/:player', createFilter, getCountPipelineResult);

app.listen(25687, '0.0.0.0',()=> {
  console.log("done!");
})
