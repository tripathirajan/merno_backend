const Product = require("../models/product.model");
const storageSerice = require("../services/storage.service");

const getProductList = async (req, res) => {
    const { page, sortBy = "createdAt", dir = 'desc', filters } = req?.query;

    const productList = await Product.find().sort({ [sortBy]: dir }).lean();

    if (productList?.length == 0) {
        return res.status(200).json({ items: [], page: 1, totalCount: 0 });
    }
    // transform data
    const items = [];
    for (const product of productList) {
        items.push({ id: product._id, name: product.name, description: product.description, price: product.price, image: product.image });
    }
    return res.status(200).json({ items, page: 1, totalCount: productList?.length });
};

const addNewProduct = async (req, res) => {
    const { name, description, price } = req?.body;
    if (!name || !description || !price) {
        return res.status(200).json({ success: false, message: 'Parameter required' });
    }
    const product = await Product.create({ name, description, price, image: '' });
    if (!product) {
        return res.status(400).json({ success: false, message: "product not added please try again." })
    }
    if (req?.file) {
        console.time('image-upload-start')
        const { url } = await storageSerice.upload(req?.file?.buffer);
        console.log("result", url);
        console.timeEnd('image-upload-start')
        if (url) { product.image = url; }
        product.save();
    }
    return res.status(200).json({ success: true, message: 'Product created' });
};

const getProductInfo = async (req, res) => {
    const { productId } = req?.query;

    if (!productId) {
        return res.status(404).json({ succes: false, message: "Parameter required" });
    }
    const productInfo = await Product.findById(productId).lean();
    if (!productInfo) {
        return res.status(404).json({ succes: false, message: "Product not found." });
    }
    return res.status(200).json({ succes: true, message: 'success', result: { id: productInfo._id, name: productInfo.name, description: productInfo.description, price: productInfo.price } })
}

const updateProductInfo = async (req, res) => {
    const { id: productId, name, description, price } = req?.body;

    if (!productId || !name || !description || !price) {
        return res.status(404).json({ succes: false, message: "Nothing to update." });
    }
    const product = await Product.findById(productId).exec();
    if (!product) {
        return res.status(400).json({ message: 'Product not found' })
    }
    const duplicate = await Product.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== productId) {
        return res.status(409).json({ message: 'Duplicate product name.' })
    }
    product.name = name;
    product.description = description;
    product.price = price;

    const updatedInfo = await product.save();
    return res.status(200).json({ message: `Product:${updatedInfo.name} updated.` });
}

const deleteProduct = async (req, res) => {
    const { id } = req?.query;
    if (!id) {
        return res.status(404).json({ succes: false, message: "Can't perform this action." });
    }
    const product = await Product.findById(id).exec();
    if (!product) {
        return res.status(404).json({ succes: false, message: "Product not found." });
    }
    const result = await product.deleteOne();
    return res.status(200).json({ succes: true, message: `${result.name} deleted success.` });
}
module.exports = {
    getProductList,
    addNewProduct,
    getProductInfo,
    updateProductInfo,
    deleteProduct
}