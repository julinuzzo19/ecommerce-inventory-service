import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();

const createHealthController = () => {
  return new HealthController();
};

// Health check básico
router.get('/health', async (req, res) => {
  const controller = createHealthController();
  return controller.healthCheck(req, res);
});

export default router;
