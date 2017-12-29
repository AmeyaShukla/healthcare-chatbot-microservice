const { Wit, log } = require('node-wit');
var diagnosisModel = require('../models/diagnosis_model');
var config = require('../config/config');
var request = require('request');


module.exports = {

        getWitData: function (message, callback) {

                const client = new Wit({ accessToken: config.witAccessToken });
                client.message(message, {}).then(data => {
                        //console.log(data);
                        callback(false,data);
                        //res.send({d:d,data:data});
                }, error => {
                        callback(error,false);
                });
        },

        addDiagnosisData:function(req,callback) {
                var dis = new diagnosisModel({
                        diesease: req.body.diesease,
                        symptoms: req.body.symptoms,
                        description: req.body.description,
                        treatment: req.body.treatment,
                });
                dis.save(dis => {
                        callback(false,dis);
                })
        },      
        getGreetingPhrase: function (callback) {
                
                console.log("asdf");
                date = new Date().getHours();
                console.log(date);
                greeting = date < 12 ? "Good Morning" : date < 16 ? "Good Afternoon" : "Good evening";
                return greeting;

        },

        getTreatments: function (item,token,callback) {

                
                var request = require('request');

                request({
                        method: 'GET',
                        url: 'https://api.healthgraphic.com/v1/conditions/'+item+'/treatments?page=1&per_page=10&fields=name&_format=json',
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'token': token
                        },
                        body: ""
                }, function (error, response, body) {
                        if(error){
                                callback(error,false);
                        } else {
                                callback(false, JSON.parse(body));
                        }
                        
                });
        },

        getSymptoms: function (item, token,callback) {

                request({
                        method: 'GET',
                        url: 'https://api.healthgraphic.com/v1/conditions/' + item +'/symptoms?page=1&per_page=10&fields=name&_format=json',
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'token': token
                        },
                        body: ""
                }, function (error, response, body) {
                        callback(false,JSON.parse(body));
                });
        },

        getDoctorsList: function (authToken, callback) {

                request({
                        method:'GET',
                        url:config.hardforksAppUrl+"/api/user/doctor-list",
                        headers: {
                                'Content-Type': 'application/json',
                                'Authorization': authToken
                        },
                },(error,response,body) => {
                        if(error) {
                                console.log("error", error);
                                callback(error,false);
                        } else {
                                console.log(response.body);
                                callback(false,JSON.parse(response.body));
                        }
                });
        },

        getMedicineInfo: function (item) {

                var aa = { "name": "medicine" };
                return aa;
        },
        
        addDiagnosis:function(req, res) {
                console.log("asdfsdf")
                this.addDiagnosisData(req,(err,data) => {
                        res.send({data:data});
                });

        },
        testEnd:function(req, res) {
          this.getHealthGraphicToken((err,token) => {
                  if(err){

                  } else {
                          console.log(token)
                        this.getSymptoms('malaria',token,(err,response) => {
                                if(err){
                                        console.log(err);
                                        res.send(err);
                                }else{
                                        console.log(typeof (response), response.response.symptoms);
                                        
                                        var sym_array = response.response.symptoms.response;
                                        if(sym_array.length > 0){
                                                acc = "";
                                                ss = sym_array.map((value) => {
                                                        return value.name;
                                                })
                                                sym_str = ss.reduce((acc,value) => {
                                                        return acc+","+value;
                                                })
                                        }
                                        console.log(symptoms_str);
                                        res.send({sym_str:sym_str});
                                }
                        })
                  }
          })      
        },
        getHealthGraphicToken:function(callback) {
                url = '/login.json';
                body = "email=" + config.email + "&password=" + config.password;
                this.makeCallToHealthGraphicApi('POST', url,"",body, (err,data) => {
                        if(err){
                                callback(err,false);
                        } else {
                                callback(false,data.token);
                        }
                });
        },

        makeCallToHealthGraphicApi:function (type, url, authToken, body, callback) {

                request({
                        method: type,
                        url: config.healthgraphicBaseUrl + url,
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'token': authToken,
                        },
                        body:body
                }, function (error, response, body) {
                        if (error) {
                                callback(error, false);
                        } else {
                                callback(false, JSON.parse(response.body));
                        }
                });
        },

}