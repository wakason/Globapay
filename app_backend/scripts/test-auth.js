const http = require('http');

function request(method, path, body) {
	return new Promise((resolve, reject) => {
		const payload = body ? Buffer.from(JSON.stringify(body)) : undefined;
		const req = http.request(
			{
				hostname: 'localhost',
				port: 5000,
				path,
				method,
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': payload ? Buffer.byteLength(payload) : 0
				}
			},
			(res) => {
				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => {
					try {
						const json = data ? JSON.parse(data) : {};
						resolve({ status: res.statusCode, body: json });
					} catch (e) {
						resolve({ status: res.statusCode, body: { raw: data } });
					}
				});
			}
		);
		req.on('error', reject);
		if (payload) req.write(payload);
		req.end();
	});
}

(async () => {
	const suffix = Math.floor(Math.random() * 1e6)
		.toString()
		.padStart(6, '0');
	const username = `testuser_${suffix}`;
	const registerPayload = {
		username,
		fullName: 'Test User',
		accountNumber: '1234567890',
		idNumber: '8001015009087',
		password: 'Test!2345'
	};

	console.log('Registering user:', username);
	const reg = await request('POST', '/api/auth/register', registerPayload);
	console.log('REGISTER ->', reg.status, JSON.stringify(reg.body));

	console.log('Logging in user:', username);
	const login = await request('POST', '/api/auth/login', {
		username,
		password: 'Test!2345'
	});
	console.log('LOGIN    ->', login.status, JSON.stringify(login.body));

	process.exit(0);
})().catch((err) => {
	console.error('ERROR', err && (err.stack || err.message || err));
	process.exit(1);
});


