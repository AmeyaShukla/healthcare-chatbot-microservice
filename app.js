var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/config');
var cors = require('cors');
const morgan = require('morgan');
const morganJson = require('morgan-json');
var req = require('request');
var utility = require('./routes/utilites.js');
var chatManager = require('./routes/chatManager.js');
var dialogFlow = require('./routes/dialogFlow.js');
var http = require('http');
const logFormat = morganJson({
  short: ':method :url :status',
  'response-time': ':response-time ms'
});


//setup configuration for app
app.use(morgan(logFormat));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var router = express.Router();
var port = process.env.PORT || 3000;

//connection to mongoose
//mongoose.connect(config.databaseUrl);
mongoose.Promise = require('bluebird');
var promise = mongoose.connect(config.databaseUrl, {
  useMongoClient: true,
  /* other options */
});

promise.then(function (db) {
  console.log("Connected to following Database => " + db.db.s.databaseName);

});



router.post("/context",(req, res) => {
  dialogFlow.addNewContext(req, res);
});

router.post("/message",(req, res) => {
  chatManager.doReply(req, res);
});

router.post('/add-diagnosis',(req, res) => {
  utility.addDiagnosis(req, res);
});

router.post('/test-end', (req, res) => {
  utility.testEnd(req, res);
});

router.post('/confirm-booking',(req, res) => {
  //console.log(req);
  res.send("success:true");
  
});
app.use('/app_v1/api', router);
app.listen(port)

console.log('ParkStash Started On Port:  ' + port);
