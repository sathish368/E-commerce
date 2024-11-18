import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { Admin, Cart, Orders, Product, User } from './Schema.js';

const app = express();

// Middleware setup
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from frontend running on port 3000
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = 6001;

// Connect to MongoDB
mongoose.connect('mongodb+srv://mydb:Mydb1@cluster0.rryni.mongodb.net/e-commerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully!');
}).catch((e) => {
    console.log(`Error in DB connection: ${e}`);
});

// API Routes
// User registration
app.post('/register', async (req, res) => {
    const { username, email, usertype, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, usertype, password: hashedPassword });
        const userCreated = await newUser.save();
        return res.status(201).json(userCreated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

// Fetch banner
app.get('/fetch-banner', async (req, res) => {
    try {
        const admin = await Admin.findOne();
        res.json(admin.banner);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error occurred' });
    }
});

// Fetch users
app.get('/fetch-users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error occurred' });
    }
});

// Fetch individual product details
app.get('/fetch-product-details/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred" });
    }
});

// Fetch all products
app.get('/fetch-products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error occurred' });
    }
});

// Fetch all orders
app.get('/fetch-orders', async (req, res) => {
    try {
        const orders = await Orders.find();
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error occurred' });
    }
});

// Fetch product categories
app.get('/fetch-categories', async (req, res) => {
    try {
        const data = await Admin.find();
        if (data.length === 0) {
            const newData = new Admin({ banner: "", categories: [] });
            await newData.save();
            return res.json(newData.categories);
        } else {
            return res.json(data[0].categories);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred" });
    }
});

// Add new product
app.post('/add-new-product', async (req, res) => {
    const { productName, productDescription, productMainImg, productCarousel, productSizes, productGender, productCategory, productNewCategory, productPrice, productDiscount } = req.body;
    try {
        if (productCategory === 'new category') {
            const admin = await Admin.findOne();
            admin.categories.push(productNewCategory);
            await admin.save();
            const newProduct = new Product({
                title: productName, description: productDescription, mainImg: productMainImg,
                carousel: productCarousel, category: productNewCategory, sizes: productSizes,
                gender: productGender, price: productPrice, discount: productDiscount
            });
            await newProduct.save();
        } else {
            const newProduct = new Product({
                title: productName, description: productDescription, mainImg: productMainImg,
                carousel: productCarousel, category: productCategory, sizes: productSizes,
                gender: productGender, price: productPrice, discount: productDiscount
            });
            await newProduct.save();
        }
        res.json({ message: "Product added!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred" });
    }
});

// Update product
app.put('/update-product/:id', async (req, res) => {
    const { productName, productDescription, productMainImg, productCarousel, productSizes, productGender, productCategory, productNewCategory, productPrice, productDiscount } = req.body;
    try {
        if (productCategory === 'new category') {
            const admin = await Admin.findOne();
            admin.categories.push(productNewCategory);
            await admin.save();

            const product = await Product.findById(req.params.id);
            product.title = productName;
            product.description = productDescription;
            product.mainImg = productMainImg;
            product.carousel = productCarousel;
            product.category = productNewCategory;
            product.sizes = productSizes;
            product.gender = productGender;
            product.price = productPrice;
            product.discount = productDiscount;

            await product.save();
        } else {
            const product = await Product.findById(req.params.id);
            product.title = productName;
            product.description = productDescription;
            product.mainImg = productMainImg;
            product.carousel = productCarousel;
            product.category = productCategory;
            product.sizes = productSizes;
            product.gender = productGender;
            product.price = productPrice;
            product.discount = productDiscount;

            await product.save();
        }
        res.json({ message: "Product updated!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred" });
    }
});

// Update banner
app.post('/update-banner', async (req, res) => {
    const { banner } = req.body;
    try {
        const data = await Admin.find();
        if (data.length === 0) {
            const newData = new Admin({ banner: banner, categories: [] });
            await newData.save();
            res.json({ message: "Banner updated" });
        } else {
            const admin = await Admin.findOne();
            admin.banner = banner;
            await admin.save();
            res.json({ message: "Banner updated" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred" });
    }
});

// Add to cart
app.post('/add-to-cart', async (req, res) => {
    const { userId, title, description, mainImg, size, quantity, price, discount } = req.body;
    try {
        const item = new Cart({ userId, title, description, mainImg, size, quantity, price, discount });
        await item.save();
        res.json({ message: 'Added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred" });
    }
});

// Place order from cart
app.post('/place-cart-order', async (req, res) => {
    const { userId, name, mobile, email, address, pincode, paymentMethod, orderDate } = req.body;
    try {
        const cartItems = await Cart.find({ userId });
        cartItems.map(async (item) => {
            const newOrder = new Orders({
                userId, name, email, mobile, address, pincode, title: item.title,
                description: item.description, mainImg: item.mainImg, size: item.size,
                quantity: item.quantity, price: item.price, discount: item.discount,
                paymentMethod, orderDate
            });
            await newOrder.save();
            await Cart.deleteOne({ _id: item._id });
        });
        res.json({ message: 'Order placed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
