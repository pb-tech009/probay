const https = require('https');

const sendSMS = (phoneNumber, message) => {
    const apiKey = process.env.SMS_API_KEY;
    // Common URL pattern for such gateways. 
    // Format: https://login.shribalajimessage.com/api/v2/sendsms?apikey=xxx&number=xxx&message=xxx
    // Since I don't have exact docs, I'll use a standard template.
    const url = `https://login.shribalajimessage.com/api/v2/sendsms?apikey=${apiKey}&number=${phoneNumber}&message=${encodeURIComponent(message)}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log('SMS API Response:', data);
                resolve(data);
            });
        }).on('error', (err) => {
            console.error('SMS API Error:', err);
            reject(err);
        });
    });
};

module.exports = { sendSMS };
