const { Router } = require('express');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');

const router = Router();

router.use('/', userRoutes);
router.use('/', authRoutes);
router.use('/', taskRoutes);

module.exports = router;