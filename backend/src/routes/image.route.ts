import { Router } from 'express';
import * as imageController from '../controllers/image.controller.js';

const router: Router = Router();

router.get('/', imageController.getAll);

router.post('/', imageController.addImage);

router.get('/:id', imageController.getOne);

router.delete('/:id', imageController.remove);

router.get('/:id/download', imageController.download);

export default router;
