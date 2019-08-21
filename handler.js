'use strict';

//requires
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');
//

//const
const poolData = {    
  UserPoolId : "us-east-1_qMkyMMKnq", // Your user pool id here    
  ClientId : "379e9oh8t2j2sfdcnnok0dttuu" // Your client id here
  }; 
const pool_region = 'us-east-1';
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
//


// Public API
module.exports.publicEndpoint = (event, context, cb) => {
  cb(null, { message: 'Welcome to our Public API!' });
};

// Private API
module.exports.privateEndpoint = (event, context, cb) => {
  cb(null, { message: 'Only logged in users can see this' });
};

module.exports.login = (event, context, cb) => {
  //console.log(JSON.stringify(event));
  
  var query = event.query;

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username : query.user,
    Password : query.password,
  });

  var userData = {
      Username : query.user,
      Pool : userPool
  };

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
          console.log('access token + ' + result.getAccessToken().getJwtToken());
          console.log('id token + ' + result.getIdToken().getJwtToken());
          console.log('refresh token + ' + result.getRefreshToken().getToken());

          cb(null, { message: 'Only logged in users can see this' , result : result });
      },
      onFailure: function(err) {
          console.log(err);
      },

  });
  
};


module.exports.RegisterUser = (event, context, cb) => {

  var attributeList = [];
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:"Prasad Jayashanka"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:"jay"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"male"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"birthdate",Value:"1991-06-21"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"address",Value:"CMB"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"profile",Value:"Admin"}))
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"locale",Value:"lima"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"picture",Value:"foto.jpg"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:"sampleEmail@gmail.com"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:"+5412614324321"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:scope",Value:"admin"}));

  userPool.signUp('sampleEmail@gmail.com', 'America*01', attributeList, null, function(err, result){
      if (err) {
          console.log(err);
          return;
      }
      let cognitoUser = result.user;
      //console.log('user name is ' + cognitoUser.getUsername());
      cb(null, { message: 'user name is ' + cognitoUser.getUsername()});

  });

}
