const { Wit, log } = require('node-wit');
var diagnosisModel = require('../models/diagnosis_model');
var config = require('../config/config');
var dialogFlow = require('../routes/dialogFlow');
var utility = require('../routes/utilites.js');
var stringSimilarity = require('string-similarity');

module.exports = {

  doReply:function(req, res) {
    console.log("--------------------------------------");
    console.log(req.headers['authorization']);
    console.log("---------------------------------------");
    utility.getWitData(req.body.message, (err, data) => {
      if(err) {

      } else {
          context = req.body.context;
          dialog = dialogFlow.solveDialogFlow(data, context);
          console.log(dialog);
          if(dialog.action == 'doctor') {
            utility.getDoctorsList(req.headers['authorization'],(err,docList) => {
              if(err){
                res.send({success:false,err:err});

              } else {

                res.send({ data: data, dialog: dialog, docList:docList });

              }
            });
          } else if (dialog.action == 'diagnosis') {
            sym_string = "";  
            if(dialog.data.length > 1){
              for(var i=0; i<dialog.data.length; i++) {
                  sym_string = sym_string+","+dialog.data[i];
              }

            } else {
              dialog.action = "incompelete_info";
            }
            console.log("symptom string",sym_string);
            diagnosisModel.find({},(err,dis) => {
              
              highest_index = -1;
              highest_score = 0;
              var score  = dis.map((value,index) => {
                var ss = stringSimilarity.compareTwoStrings(sym_string, value.symptoms);
                if(ss >= highest_score) {
                  highest_score = ss;
                  highest_index = index;
                }
                console.log(ss);
                return ss;
              });
              console.log(dis[highest_index]);
              dialog.context.diagnosis = dis[highest_index].diesease;
              res.send({ data: data, dialog: dialog});
            });
          }else if(dialog.action == 'symptoms'){
            utility.getHealthGraphicToken((err, token) => {
              if (err) {

              } else {
                console.log(token)
                utility.getSymptoms(dialog.data, token, (err, response) => {
                  if (err) {
                    console.log(err);
                    res.send(err);
                  } else {
                    console.log(typeof (response), response);

                    var sym_array = response.response.symptoms.response;
                    sym_str ="";
                    if (sym_array.length > 0) {
                      acc = "";
                      ss = sym_array.map((value) => {
                        return value.name;
                      })
                      sym_str = ss.reduce((acc, value) => {
                        return acc + "," + value;
                      })
                    }
                    res.send({ data: data, dialog: dialog,symptoms:sym_str });
                  }
                })
              }
            })
          } else if (dialog.action == 'treatment'){
            utility.getHealthGraphicToken((err, token) => {
              if (err) {

              } else {
                console.log(token)
                utility.getTreatments(dialog.data, token, (err, response) => {
                  if (err) {
                    console.log(err);
                    res.send(err);
                  } else {
                    console.log(typeof (response), response);

                    var sym_array = response.response.treatments.response;
                    sym_str = "";
                    if (sym_array.length > 0) {
                      acc = "";
                      ss = sym_array.map((value) => {
                        return value.name;
                      })
                      sym_str = ss.reduce((acc, value) => {
                        return acc + "," + value;
                      })
                    }
                    res.send({ data: data, dialog: dialog, treatment: sym_str });
                  }
                })
              }
            })
          } else {
             res.send({ data: data, dialog: dialog}); 
          }
          
      }
    });
  }
  
  //end of module
}