import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createApp } from '../server/app.ts';
import { initializeDatabase, db } from '../server/db/index.ts';

// Isolated browser QA serves the built frontend without a development websocket.
await initializeDatabase();
const app=createApp(),directory=path.resolve(import.meta.dirname,'../dist');
app.use(express.static(directory));
app.get('*',(_req,res)=>res.sendFile(path.join(directory,'index.html')));
const server=app.listen(Number(process.env.PORT),'127.0.0.1');
process.once('SIGTERM',()=>{server.close();void db.end();});
