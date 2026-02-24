const https = require('https');

const sendSMS = (phoneNumber, message) => {
    const apiKey = process.env.SMS_API_KEY;
    
    // Add country code if not present (India: 91)
    let formattedNumber = phoneNumber;
    if (phoneNumber.length === 10 && !phoneNumber.startsWith('91')) {
        formattedNumber = '91' + phoneNumber;
    }
    
    // WhatsApp API format - Shree Balaji Message
    const postData = JSON.stringify({
        contact: [
            {
                number: formattedNumber,
                message: message
            }
        ]
    });
    
    const options = {
        hostname: 'login.shribalajimessage.com',
        port: 443,
        path: '/api/whatsapp/send',
        method: 'POST',
        headers: {
            'Api-key': apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    console.log(`📱 Sending WhatsApp message to ${formattedNumber} (original: ${phoneNumber})`);
    console.log(`📝 Message: ${message}`);

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`✅ WhatsApp API Response (Status ${res.statusCode}):`, data);
                
                try {
                    const jsonResponse = JSON.parse(data);
                    console.log('📊 Parsed Response:', JSON.stringify(jsonResponse, null, 2));
                    
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        console.log('✅ WhatsApp message sent successfully!');
                    } else {
                        console.log('⚠️ WhatsApp API returned non-success status:', res.statusCode);
                    }
                    
                    resolve(jsonResponse);
                } catch (e) {
                    console.log('📄 Raw Response (not JSON):', data.substring(0, 500));
                    resolve(data);
                }
            });
        });
        
        req.on('error', (err) => {
            console.error('❌ WhatsApp API Error:', err);
            reject(err);
        });
        
        // Write data to request body
        req.write(postData);
        req.end();
    });
};

module.exports = { sendSMS };
