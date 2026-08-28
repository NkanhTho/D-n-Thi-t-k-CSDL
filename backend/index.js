require('dotenv').config();
require('./config/db');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const { verifyToken, checkRole } = require('./middleware/authMiddleware');

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Backend đang chạy!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy ở port ${PORT}`));