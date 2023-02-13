import { MongoClient } from "mongodb";
import * as dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.connection);

const db = client.db("admin_minigames");
export const winner = db.collection('winner');
export const news = db.collection('news');

