'use strict';

const fetch = require("node-fetch");
global.fetch = require("node-fetch");
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

// Public API
module.exports.publicEndpoint = (event, context, cb) => {
  cb(null, { message: 'Welcome to our Public API!' });
};

// Private API
module.exports.privateEndpoint = (event, context, cb) => {
  cb(null, { message: 'Only logged in users can see this' });
};

module.exports.publicEndpointLogin = (event, context, cb) => {
  //console.log(JSON.stringify(event));
  
  var query = event.query;
  var response = {};

  var authenticationData = {
    Username : query.user,
    Password : query.password,
  };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  var poolData = { UserPoolId : 'us-east-1_HujxTNaAK',
      ClientId : '71ihq29b9v66tm3pusvib1e12e'
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
      Username : query.user,
      Pool : userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {

        console.log('aca');
          var accessToken = result.getAccessToken().getJwtToken();

          /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
          var idToken = result.idToken.jwtToken;

          response = result;
      },

      onFailure: function(err) {
         console.log(err);
         cb(null, { message: 'Welcome to our Public API!' , data :response });
          //alert(err);
      },

  });

  
  //query = JSON.parse(query);
  //console.log(query.user);
  
  
};

