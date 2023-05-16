import express, { Application, Request, Response } from "express";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';

import imageRouter from './routes/image.route.js';

dotenv.config({
    path: './.env'
})

if (!fs.existsSync('./img')){
    fs.mkdirSync('./img');
}

const PORT = process.env.PORT || 5000;

const app: Application = express();

// middleware
app.use(bodyParser.json());

// routers
app.use('/api/image', imageRouter);

// index route of app
app.get('/', async (req: Request, res: Response) => {
    res.json({ message: 'root' });
});

app.get('/*', (req: Request, res: Response) => {
    res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
    console.log('Server listening on port', PORT);
});
