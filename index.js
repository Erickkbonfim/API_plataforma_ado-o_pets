const express = require('express')
const cors = require('cors')

const app = express()
const port = 5000

const conn = require('../backend/db/conn')

const userRoutes = require('./routes/userRoutes')
const petRoutes = require('./routes/petRoutes')

app.use(express.json())


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'))

//Rotas
app.use('/user', userRoutes)
app.use('/pet', petRoutes)


app.listen(port, ()=> {
    console.log('rodando na porta ' + port)
})