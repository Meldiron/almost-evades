const sdk = require('node-appwrite');

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req, res) {
	const client = new sdk.Client();

	const databases = new sdk.Databases(client);

	if (!req.variables['APPWRITE_FUNCTION_ENDPOINT'] || !req.variables['APPWRITE_FUNCTION_API_KEY']) {
		throw new Error('Environment variables are not set. Function cannot use Appwrite SDK.');
	}

	client
		.setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
		.setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
		.setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);

	const payload = JSON.parse(req.payload ? req.payload : '{}');

	if (!payload.nickname) {
		res.json({ ok: false, msg: 'Please enter nickname.' });
		return;
	}

	const nickname = payload.nickname;
	const userId = req.variables['APPWRITE_FUNCTION_USER_ID'];

	let profileFound = false;

	try {
		const _profile = await databases.getDocument('default', 'profiles', userId);
		profileFound = true;
	} catch (err) {}

	if (profileFound) {
		res.json({ ok: false, msg: 'Profile already exists. Refreshing page should fix it.' });
		return;
	}

	try {
		await databases.createDocument(
			'default',
			'profiles',
			userId,
			{
				nickname
			},
			[sdk.Permission.update(sdk.Role.user(userId))]
		);
	} catch (err) {
		console.log(err);
		res.json({ ok: false, msg: 'Profile with this nickname already exists.' });
		return;
	}

	res.json({
		ok: true,
		msg: 'Profile successfully created.'
	});
	return;
};
