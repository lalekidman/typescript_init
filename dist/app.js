"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: `${__dirname}/../.env` });
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const HttpStatus = require("http-status-codes");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const socketio = require("socket.io");
const http_1 = require("http");
const SECRET = 'TOTAL_SECRET_POWERED_BY_KYOO_PH';
const branches_1 = require("./routes/branches");
const queue_settings_1 = require("./routes/queue-settings");
const advertisement_settings_1 = require("./routes/advertisement-settings");
class App {
    constructor() {
        this.app = express();
        this.HttpServer = http_1.createServer(this.app);
        this.Port = process.env['PORT'] || 3000;
        this.DBURI = `mongodb://${process.env.DB_HOST}/kyoodb_branches`;
        console.log('db: ', this.DBURI);
        this._init();
    }
    mountRoutes() {
        // Where the router import
        this.app.use('/:branchId/advertisement-settings', new advertisement_settings_1.default().initializeRoutes());
        this.app.use('/:branchId/queue-settings', new queue_settings_1.default().initializeRoutes());
        this.app.use('', new branches_1.default().initializeRoutes());
    }
    initSocket(server) {
        this.io = socketio(server);
        this.io.on('connect', (socket) => {
            console.log('someone is connected, ', socket.handshake.headers.authorization);
            // setTimeout(() => {
            //   socket.disconnect();
            // }, 3000)
            socket.on('disconnect', () => {
                console.log('user:', socket.id);
                console.log('user disconnected');
            });
        });
    }
    initMongodb() {
        mongoose.connect(this.DBURI, { useNewUrlParser: true }).then((res) => {
            console.log('Successfully connected to database.');
        }).catch((err) => {
            console.log('Failed to connect to the database. Error: ', err);
        });
    }
    listen(port) {
        this.server = this.app.listen(port || this.Port, () => {
            console.log(`Listening to port ${this.Port}`);
        });
        this.initSocket(this.server);
    }
    _init() {
        this.app.use(morgan('dev'));
        this.app.use(express.static(path.join(__dirname, '../views')));
        this.app.set('views', path.join(__dirname, '../views'));
        this.app.set('view engine', 'hbs');
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // this.app.use(session({
        //   secret: SECRET,
        //   saveUninitialized: true,
        //   resave: true
        // }))
        this.app.use(flash());
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Authorization, Content-Type, Accept');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
                return res.sendStatus(HttpStatus.OK);
            }
            next();
        });
        this.mountRoutes();
        this.initMongodb();
    }
}
const app = new App();
app.listen();
