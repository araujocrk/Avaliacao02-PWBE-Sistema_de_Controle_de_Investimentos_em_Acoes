const express = require('express')
const app = express()

// DOTENV
const dotenv = require("dotenv")
dotenv.config()

const port = process.env.APP_PORT

// ENGINE E LAYOUT
app.set('view engine', 'ejs')
app.set('views', 'views')
const expressLayouts = require('express-ejs-layouts')
app.use(expressLayouts)

// Sessões
const expressSession = require('express-session')
const pgSession = require('connect-pg-simple')(expressSession)
const pool = require('./databases/postgres')

const sessionOptions = expressSession({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SECRET_NAME,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 1,
        httpOnly: true
    },
    rolling: true
})
app.use(sessionOptions)

app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(express.static('public'))


// ROTAS
const homeRoute = require('./routes/homeRoute');
const userRoute = require('./routes/userRoute');
const operacoesRoute = require('./routes/operacoesRoute');

app.use('/', homeRoute);
app.use('/user', userRoute);
app.use('/operacoes', operacoesRoute);

// const errorHandler = require('./middlewares/errorHandler');
// app.use(errorHandler);



app.listen(port, () => {
    console.log('Iniciando Intellinvest na porta ' + port)
}) 