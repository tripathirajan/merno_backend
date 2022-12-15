const Product = require("../models/product.model");
const User = require("../models/user.model");

exports.getUserCart = async (req, res) => {
    const userId = req?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized', result: [] });
    }
    const user = await User.findOne({ _id: userId }).populate('cart.items.productId');
    const filteredItems = user.cart.items?.filter(product => product?.productId !== null);
    if (filteredItems?.length > 0 && filteredItems?.length !== user?.cart?.items?.length) {
        user.cart.items = filteredItems;
        user.save();
    }
    res.status(200).json({ message: 'success', result: user?.cart?.items || [] });
}
exports.addToCart = async (req, res) => {
    const productId = req?.body?.productId;
    const userId = req?.userId;
    const user = await User.findById(userId);
    const product = await Product.findById(productId).lean().exec();
    const added = await user.addToCart(product);
    res.status(200).json({ message: 'success', result: [] });
}