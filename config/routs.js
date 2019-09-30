const products = require('../app/controllers/products');
const auth = require('../app/controllers/auth');

module.exports = (app) => {
	//products
	app.get('/products',products.getAll);
	app.post('/products',products.create);
	app.put('/products/:id',products.update);
	app.delete('/products/:id',products.remove);
	//auth
	app.post('/signin', auth.signIn);
	app.post('/registration', auth.registration);
	app.get('/activate/:email', auth.activate);
	app.put('/user-update/:id', auth.update);
	app.post('/refresh-tokens', auth.refreshTokens);
	app.delete('/remove/:id',auth.remove);
};