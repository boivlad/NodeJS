const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/online-store');

const app = express();
app.use(bodyParser.json());

const Product = mongoose.model('Product', {
	id: Number,
	name: String,
	price: mongoose.Schema.Types.Decimal128,
});
// const products = [
// {
// 	id: 1,
// 	name: 'phone2',
// 	price: 300,
// },
// {
// 	id: 2,
// 	name: 'tablet',
// 	price: 600,
// }
// ];

app.get(
	'/products', 
	(req, res) => Product.find()
	.exec()
	.then(products => res.json(products)),
	);

app.post(
	'/products', 
	(req, res) => Product.create(req.body)
	.then(createdProduct => res.json(createdProduct)),
);

app.put(
	'/products/:id', 
	(req, res) => Product.findOneAndUpdate({id: req.params.id}, req.body)
	.exec()
	.then(product => res.json(product)),
);
// app.delete('/products/:id', (req, res) => {
// 	const product = products.find(p => p.id === +req.params.id);
// 	const productIndex = products.indexOf(product);
// 	products.splice(productIndex, 1);
// 	res.json({success: true});
// });

app.listen(3000, () => console.log('Listening on port 3000'));
