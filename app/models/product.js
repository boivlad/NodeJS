const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema(
	{
		id: Number,
		name: String,
		price: mongoose.Schema.Types.Decimal128,
	}
);
const Product = mongoose.model('Product', ProductSchema);