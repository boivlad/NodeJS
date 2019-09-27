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
	app.put('/activate/:email', auth.activate);
};