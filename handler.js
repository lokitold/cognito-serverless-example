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
  UserPoolId : "us-east-1_rgJMVMg9z", // Your user pool id here    
  ClientId : "4m0uel55lb2vula7ql9fa62qtl" // Your client id here
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

  console.log(JSON.stringify(event));
  console.log('test private2');

  const response = {
    statusCode: 200,
    headers: {
      'x-custom-header': 'My Header Value',
    },
    body: JSON.stringify( { message: 'Only logged in users can see this' }),
  };

  cb(null,  response );
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

  console.log(JSON.stringify(event));

  //let body = JSON.parse(event.body) ;
  let body = event.body ;
  console.log(body);

  var attributeList = [];
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value: body.name }));
  //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"username",Value: body.username }));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value: body.username }));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value: body.gender }));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"birthdate",Value:"1991-06-21"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"address",Value:"CMB"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"profile",Value:"Admin"}))
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"locale",Value:"lima"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"picture",Value:"foto.jpg"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value: body.email}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:"+5412614324321"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:scope",Value:"admin"}));

  userPool.signUp(body.email, body.password, attributeList, null, function(err, result){
      
      if (err) {
          console.log(err);
          cb(JSON.stringify(err));
          return;
      }

      let cognitoUser = result.user;
      //console.log('user name is ' + cognitoUser.getUsername());
      cb(null, { message: 'user name is ' + cognitoUser.getUsername()});

  });

}
