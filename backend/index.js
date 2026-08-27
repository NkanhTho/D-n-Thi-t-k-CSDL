require('dotenv').config();
require('./config/db');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Backend đang chạy!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy ở port ${PORT}`));