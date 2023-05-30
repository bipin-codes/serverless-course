const generatePolicy = (principalId, effect, resource) => {
  const authResponse = { principalId };
  if (effect && resource) {
    let policyDocument = {
      version: '2023-10-17',
      statement: [
        {
          Effect: effect,
          Resource: resource,
          action: 'execute-api:Invoke',
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
exports.handler = (event, context, callback) => {
  const token = event.authorizationToken; //'allow' 'deny'
  switch (token) {
    case 'allow':
      callback(null, generatePolicy('user', 'Allow', event.methodArn));
      break;
    case 'deny':
      callback(null, generatePolicy('user', 'Deny', event.methodArn));
      break;
    default:
      callback('Errror: Invalid Token');
  }
};
