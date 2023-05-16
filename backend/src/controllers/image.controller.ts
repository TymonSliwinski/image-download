import { Request, Response } from "express"
import { Prisma, Status } from "@prisma/client";
import fs from 'fs';

import prisma from '../prismaClient.js';
import { validateUrl } from "../helpers/validators.js";
import addToQueue from "../services/queue.service.js";


export const getAll = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    try {
        const images = await prisma.image.findMany({
            take: size,
            skip: (page - 1) * size
        });
        return res.status(200).json({ data: images, meta: { page, size } });
    } catch (err) {
        return res.status(500).json(err);
    }
};


export const getOne = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid id' })
    }

    try {
        const image = await prisma.image.findFirst({
            where: {
                id: id
            }
        })
        if (image)
            return res.status(200).json(image);
        else
            return res.status(404).json({ message: 'Not found' });
    } catch (err) {
        return res.status(500).json(err);
    }
};


export const addImage = async (req: Request, res: Response) => {
    const { url } = req.body;
    if (typeof url !== 'string' || !validateUrl(url)) {
        return res.status(400).json({ message: 'Invalid url format' });
    }

    const name = req.body.name ? '' + req.body.name : '';
    let image;
    try {
        image = await prisma.image.create({
            data: {
                name,
                urlSource: url,
                filePath: null
            }
        });
        addToQueue(image);
    } catch (err) {
        // if resource is already present in the database
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            image = await prisma.image.findFirst({ where: { urlSource: url } });
            return res.status(303).redirect(`/api/image/${image?.id}`);
        }
        return res.status(500).json({ message: 'Error ocured while adding image', err });
    }
    return res.status(201).setHeader('Location', `/api/image/${image?.id}`).json(image);
};


export const remove = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid id' })
    }

    try {
        const image = await prisma.image.delete({
            where: {
                id
            }
        });
        if (image.filePath)
            fs.unlink(image.filePath, err => { 
                if (err) throw err;
            });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
                return res.status(404).json({
                    message: 'Resource cannot be deleted because it does not exist on the server'
                });
            }
        }
        return res.status(500).json(err);
    }
    return res.sendStatus(204);
};


export const download = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    const image = await prisma.image.findFirst({
        where: {
            id
        }
    });

    if (!image?.filePath || !fs.existsSync(image?.filePath)) {
        prisma.image.update({
            where: {
                id
            },
            data: {
                filePath: null,
                status: Status.ERROR
            }
        });

        return res.status(418).json({
            message: 'Error: Resource cannot be downloaded because it does not exist on the server'
        });
    }
    res.status(200).download(image.filePath);
};
