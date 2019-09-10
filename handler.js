'use strict';

//requires
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
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
      'x-custom-header': 'My Header Value2',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
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


module.exports.RefreshToken= (event, context, cb) => {

  console.log(JSON.stringify(event));
  let body = event.body;

  const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken: body.refresh_token});

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const userData = {
      Username: body.email,
      Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.refreshSession(RefreshToken, (err, session) => {
      if (err) {
          console.log(err);
      } else {
          let retObj = {
              "access_token": session.accessToken.jwtToken,
              "id_token": session.idToken.jwtToken,
              "refresh_token": session.refreshToken.token,
          }
          cb(null, { message: 'Only logged in users can see this' , result : session });
          //console.log(retObj);
      }
  })
}

// Accept a POST with a JSON structure containing the
// refresh token provided during the original user login, 
// and an old and new password.
module.exports.changeUserPassword = (event, context, callback) => {
  // Extract relevant JSON into a request dict (This is my own utility code)
  let requiredFields = ['old_password','new_password','refresh_token'];
  //let request = Utils.extractJSON(event['body'], requiredFields);
  //if (request == false) {
    //Utils.errorResponse("Invalid JSON or missing required fields", context.awsRequestId, callback);
    //return; // Abort here
    //}
  let request = event['body'];


  // This function can NOT be handled by admin APIs, so we need to
  // authenticate the user (not the admin) and use that
  // authentication instead.
  let refreshToken = request['refresh_token']

  // Authenticate as the user first, so we can call user version
  // of the ChangePassword API
  console.log(event);
  cognitoidentityserviceprovider.adminInitiateAuth({
    AuthFlow: 'REFRESH_TOKEN',
    ClientId: poolData.ClientId,
    UserPoolId: poolData.UserPoolId,
    AuthParameters: {
      'REFRESH_TOKEN': refreshToken
    },
    ContextData:  {
      HttpHeaders: [ /* required */
        {
          headerName: 'User-Agent',
          headerValue: event.headers['User-Agent']
        },
        /* more items */
      ],
      IpAddress: event.identity.sourceIp, /* required */
      ServerName: event.headers['Host'], /* required */
      ServerPath: '/api/update-password', /* required */
      //EncodedData: 'STRING_VALUE'
    }
  }, function(err, data) {
    if(err){
      //Utils.errorResponse(err['message'], context.awsRequestId, callback);
      callback(JSON.stringify(err));
      
      return // Abort here
    } else {
      // Now authenticated as user, change the password
      let accessToken = data['AuthenticationResult']['AccessToken'] // Returned from auth - diff signature than Authorization header
      let oldPass = request['old_password']
      let newPass = request['new_password']
      let params = {
        AccessToken: accessToken, /* required */
        PreviousPassword: oldPass, /* required */
        ProposedPassword: newPass /* required */
      }

      // At this point, really just a pass through
      cognitoidentityserviceprovider.changePassword(params, function(err2, data2) {
        if(err2){
          let message = {
            err_message: err2['message'],
            access_token: accessToken
          }
          //Utils.errorResponse(message, context.awsRequestId, callback);
          callback(JSON.stringify(message));
        } else {
          let response = {
            'success': 'OK',
            'response_data': data2 // Always seems to be empty
          }
          callback(null,response)
        }
      });
    }
  });

}



module.exports.testDocumentDB = (event, context, callback) => {

  console.log(JSON.stringify(event));
  let body = event.body ;

  var client = MongoClient.connect(
    process.env.DATABASE, 
    {
      useNewUrlParser: true
    },
    
    function(err, client) {

        if(err)
            throw err;

        //Specify the database to be used
        let db = client.db('test');
        
        //Specify the collection to be used
        let col = db.collection('test');
    
        //Insert a single document
        col.insertOne({'hello':'Amazon DocumentDB'}, function(err, result){
          //Find the document that was previously written
          col.findOne({'hello':'Amazon DocumentDB'}, function(err, result){
            //Print the result to the screen
            callback(null,result);
            //Close the connection
            client.close()
          });
       });
    });


}