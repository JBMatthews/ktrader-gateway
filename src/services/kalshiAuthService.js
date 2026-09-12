const crypto = require('crypto');

/*
 * Creates the RSA-PSS SHA-256 signature required by Kalshi.
 */
function signRequest(privateKeyPem, timestamp, method, path) {

    const pathWithoutQuery =
        path.split('?')[0];

    const message =
        timestamp +
        method.toUpperCase() +
        pathWithoutQuery;

    const signer =
        crypto.createSign('RSA-SHA256');

    signer.update(message);
    signer.end();

    const signature = signer.sign({
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    });

    return signature.toString('base64');
}


/*
 * Builds the three authentication headers
 * required by Kalshi.
 */
function buildAuthHeaders(account, method, path) {

    const timestamp =
        Date.now().toString();

    const signature =
        signRequest(
            account.private_key,
            timestamp,
            method,
            path
        );

    return {
        'KALSHI-ACCESS-KEY':
            account.api_key_id,

        'KALSHI-ACCESS-TIMESTAMP':
            timestamp,

        'KALSHI-ACCESS-SIGNATURE':
            signature
    };
}


module.exports = {
    signRequest,
    buildAuthHeaders
};
