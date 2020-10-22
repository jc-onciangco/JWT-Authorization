require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.set('view-engine', 'ejs');
app.use(express.urlencoded({
    extended: false
  }));

const userRouter = require('./router/authRoute');
app.use('/',userRouter);  

app.listen(8000, () => {
    console.log('Server running...')
});