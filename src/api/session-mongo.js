//---------cokie parser & session ---------------------
import express from 'express'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo'
/* ------------------------------------------------*/
/*           Persistencia por MongoDB              */
/* ------------------------------------------------*/
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
/* ------------------------------------------------*/
/*           Session Router                        */
/* ------------------------------------------------*/
const { Router } = express
const sessionRouter = new Router()

sessionRouter.use(cookieParser())
sessionRouter.use(session({
    /* ----------------------------------------------------- */
    /*           Persistencia por redis database             */
    /* ----------------------------------------------------- */
    store: MongoStore.create({ 
        //En Atlas connect App :  Make sure to change the node version to 2.2.12:
        mongoUrl: 'mongodb://daniel:daniel123@cluster0-shard-00-00.nfdif.mongodb.net:27017,cluster0-shard-00-01.nfdif.mongodb.net:27017,cluster0-shard-00-02.nfdif.mongodb.net:27017/sesiones?ssl=true&replicaSet=atlas-bwvi2w-shard-0&authSource=admin&retryWrites=true&w=majority',
        mongoOptions: advancedOptions
    }),
    /* ----------------------------------------------------- */

    secret: 'MySecret',
    resave: false,
    saveUninitialized: false/* ,
    rolling: true,
    cookie: {
        maxAge: 60000
    } */
}))

const getNameSession = req => req.session.name? req.session.name: ''

sessionRouter.get('/', (req,res) => {
    if(req.session.contador) {
        req.session.contador++
        console.log(`${getNameSession(req)} visitaste la página ${req.session.contador} veces.`)
        res.redirect('/index')
    }
    else {
        let { name } = req.query
        req.session.name = name
        req.session.contador = 1
        console.log(`Nuevo ingreso: ${getNameSession(req)}. Contador Visitas: ${req.session.contador}.`)
        res.redirect('/index')
    }
})

sessionRouter.get('/logout', (req,res) => {
    const name = req.session?.name
    if (name) {
        req.session.destroy(err => {
            if (!err) {
                res.render(('./logout'), { name })
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/')
    }
})

sessionRouter.get('/login', (req,res) => {
    const name = req.session?.name
    if (name) {
        //si existe la session enviamos a index
        res.redirect('/index')
    } else {
        //Redirigimos a la página de login
        res.render('./login')
    }
})

sessionRouter.get('/info', (req,res) => {
    console.log('------------ req.session -------------')
    console.log(req.session)
    console.log('--------------------------------------')

    console.log('----------- req.sessionID ------------')
    console.log(req.sessionID)
    console.log('--------------------------------------')

    console.log('----------- req.cookies ------------')
    console.log(req.cookies)
    console.log('--------------------------------------')

    console.log('---------- req.sessionStore ----------')
    console.log(req.sessionStore)
    console.log('--------------------------------------')

    console.log('---------- req.session.name ----------')
    console.log(req.session?.name)
    console.log('--------------------------------------')

    res.send('Send info ok!')
})

sessionRouter.post('/login', (req, res) => {
    req.session.name = req.body.name
    res.redirect('/index')
})

export function webAuth(req, res, next) {
    if (req.session?.name) {
        next()
    } else {
        res.redirect('/login')
    }
}

export function apiAuth(req, res, next) {
    if (req.session?.name) {
        next()
    } else {
        res.status(401).json({ error: 'Ud. no está autorizado!' })
    }
}

export default sessionRouter
