var contextModel = require('../models/context_model');
var sync = require('async');
var utility = require('../routes/utilites.js');


module.exports = {

        addNewContext: function(req, res) {
            newContext = new contextModel({
                context_text: req.body.context_text,
                context_value: req.body.context_value,
                description: req.body.description
            });
            newContext.save((err, context) => {
                if (err){
                    console.log(err);
                    res.send(err);
                } else {
                    console.log(context);
                    res.send(context);
                }
            });
    },

    solveDialogFlow: function(response, context) {

        data = response.entities;
        responseKeys = Object.keys(data);
        console.log(JSON.stringify(response));
        console.log(responseKeys);

        // not able to understand anything
        if (responseKeys.length == 0) {
            toDo = { 'action': 'nothing' };
            return toDo;
        }

        //decision making based on context
        if(Object.keys(context).length > 0) {

            if(context.topic === 'appointment_booking') {
                console.log("appointment",response);
                if(responseKeys.indexOf('intent') > -1) {
                    if (data['intent']['0']['value'] == 'reply_positive' && data['intent']['0']['confidence'] > 0.5){

                        toDo = {'action':'ask_date_time',context:context};
                        return toDo;
                    }
                    if (data['intent']['0']['value'] == 'reply_negative' && data['intent']['0']['confidence'] > 0.5) {

                        toDo = {'action':'reply_negative',context:context};
                        return toDo;
                    }
                }
                if(responseKeys.indexOf('booking_date_time') > -1) {
                    console.log("bookinf_Do");
                    context.booking_date = data['booking_date_time'][0]['value'];
                    toDo = {'action':'doctor',data:'me', context:context};
                    return toDo;
                }
            }
        }

        //got NLP data,block for doing actions
        if (responseKeys.length >= 1) {
            // handle for greetings
            if (responseKeys.indexOf('greetings') > -1 && data['greetings'][0]['confidence'] > 0.5) {
                greetingPhase = utility.getGreetingPhrase();
                toDo = { action: 'greet', message: "Hey Ameya," + greetingPhase + ", How can I help u?" };
                return toDo;
            }
            //Handle for diagnois of disease
            if (responseKeys.indexOf('user_symptoms') > -1) {

                var symptomsArray = data['user_symptoms'].map((symptom,index,array)=>{
                    return symptom.value;
                });
                toDo = {action:'diagnosis',data:symptomsArray,context:context};
                return toDo;

            }


            //handle for treatment or symptoms 
            if (responseKeys.indexOf('look_for') > -1 && responseKeys.indexOf('search_item') > -1) {
                    if (data['look_for'][0]['confidence'] > 0.5) {
                        
                        if (data['look_for'][0]['value'] === 'symptoms' || data['look_for'][0]['value'] === 'symptom') {
                            if(data['search_item'][0].confidence > 0.5) {
                                toDo = { 'action': 'symptoms', data: data['search_item'][0].value, context: context };
                                return toDo;
                            }
                        }

                        if (data['look_for'][0]['value'] === 'treatment' || data['look_for'][0]['value'] === 'treatments') {
                            if (data['search_item'][0].confidence > 0.5) {
                                toDo = { 'action': 'treatment', data: data['search_item'][0].value, context: context};
                                return toDo;
                            }
                        }
                    }
            }

            //handle for looking doctors
            if (responseKeys.indexOf('look_for') > -1 && responseKeys.indexOf('user_location') > -1) {
                console.log("inside doctor");
                    if (data['look_for'][0]['confidence'] > 0.5) {
                        if (data['look_for'][0]['value'] === 'doctor' || data['look_for'][0]['value'] === 'doctors') {
                            toDo = { 'action': 'doctor', data: data['user_location'][0].value, context: context };
                            return toDo;
                        }
                    }

            }

            //handle for getting medicine information
            if (responseKeys.indexOf('medicine_name') > -1) {
                toDo = { 'action': 'medicine', data: data['medicine_name'][0].value, context: context};
                return toDo;
            }

            toDo = { 'action': 'nothing', context: context };
            return toDo;
            //end of action block
        }

    },
    
}