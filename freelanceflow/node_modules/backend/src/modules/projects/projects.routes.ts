import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject } from './projects.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
