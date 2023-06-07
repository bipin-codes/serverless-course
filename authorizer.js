const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { COGNITO_USERPOOL_ID, COGNITO_WEBCLIENT_ID } = process.env;
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USERPOOL_ID,
  tokenUse: 'id',
  clientId: COGNITO_WEBCLIENT_ID,
});

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = { principalId };
  if (effect && resource) {
    let policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: effect,
          Resource: resource,
          Action: 'execute-api:Invoke',
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }
  console.log(JSON.stringify(authResponse));
  authResponse.context = {
    foo: 'bar',
  };

  return authResponse;
};
exports.handler = async (event, context, callback) => {
  const token = event.authorizationToken;
  console.log(token);

  try {
    const payload = await jwtVerifier.verify(token);
    console.log(payload);
    callback(null, generatePolicy('user', 'Allow', event.methodArn));
  } catch (e) {
    callback('Errror: Invalid Token');
  }
  // const token = event.authorizationToken; //'allow' 'deny'
  //   switch (token) {
  //     case 'allow':
  //       callback(null, generatePolicy('user', 'Allow', event.methodArn));
  //       break;
  //     case 'deny':
  //       callback(null, generatePolicy('user', 'Deny', event.methodArn));
  //       break;
  //     default:
  //       callback('Errror: Invalid Token');
  //   }
};
