const auth = require('../app/controllers/auth');

module.exports = (app) => {
	//auth
	app.post('/signin', auth.signIn);
	app.post('/registration', auth.registration);
	app.get('/activate/:email', auth.activate);
	app.put('/user-update/:id', auth.update);
	app.post('/refresh-tokens', auth.refreshTokens);
	app.delete('/remove/:id',auth.remove);
};