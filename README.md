#reference 

    https://github.com/serverless/examples/tree/master/aws-node-auth0-cognito-custom-authorizers-api
    https://medium.com/@prasadjay/amazon-cognito-user-pools-in-nodejs-as-fast-as-possible-22d586c5c8ec
        #split stack 
        https://github.com/dougmoscrop/serverless-plugin-split-stacks
    https://serverless.com/blog/cors-api-gateway-survival-guide/



#comands 

    sls deploy --stage dev
    sls deploy --stage dev --aws-profile sbperu
    sls deploy --stage dev -f register --aws-profile sbperu
    sls deploy --stage dev -f register
    sls deploy --stage dev -f auth
    sls invoke local -f register -s dev --path event.json
    sls invoke local -f login -s dev --path event.json
    serverless logs -f auth -t --startTime 1m
    serverless logs -f register -t --startTime 5m --aws-profile sbperu