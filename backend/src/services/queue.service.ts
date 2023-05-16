import { Image, Status } from '@prisma/client';
import Queue from 'bull';
import prisma from '../prismaClient.js';
import downloadImage from './download.service.js';
import path from 'path';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl)
    throw new Error('Redis url missing');

const queue = new Queue<Image>('download queue', redisUrl, {
    redis: { 
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        enableTLSForSentinelMode: false
    },
    defaultJobOptions: {
        attempts: 3
    }
});

const processor = async (job: any, done: any) => {
    let fileName;
    let image = await prisma.image.update({
        where: {
            id: job.data.id
        },
        data: {
            status: Status.STARTED,
        }
    });

    try {
        fileName = await downloadImage(job.data.urlSource);
    }
    catch (err) {
        await prisma.image.update({
            where: {
                id: job.data.id
            },
            data: {
                status: Status.ERROR
            }
        });
        return done(null, err);
    }

    const downloadedAt = new Date();
    const name = image.name || path.basename(fileName);
    image = await prisma.image.update({
        where: {
            id: job.data.id
        },
        data: {
            name,
            status: Status.FINISHED,
            filePath: path.relative(process.cwd(), fileName),
            downloadedAt
        }
    });
    return done(null, image);
};

queue.process(processor);

const addToQueue = (image: Image) => {
    queue.add(image);
};

export default addToQueue;
