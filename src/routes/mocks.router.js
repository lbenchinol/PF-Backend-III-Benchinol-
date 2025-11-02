import { Router } from 'express';
import mocksController from '../controllers/mocks.controller.js';

const router = Router();

router.get('/mockingpets', mocksController.generatePet);
router.get('/mockingusers', mocksController.generateUser);
router.post('/generateData', mocksController.generateData);

export default router;