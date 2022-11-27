const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// const categories = require('./data/categories.json');
// const products = require('./data/products.json')
 
// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lo9eyry.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        categoryOptionCollection = client.db('carShop').collection('categories');
        productOptionCollection = client.db('carShop').collection('products');

        app.get('/categories', async(req, res) => {
            const query = {};
            const options = await categoryOptionCollection.find(query).toArray();
            res.send(options);
        });

        // app.get('/products', async(req, res) => {
        //     const query = {};
        //     const options = await productOptionCollection.find(query).toArray();
        //     res.send(options);
        // });

        app.get('/category/:id', async(req, res) => {
            const id = req.params.id;
            const query = {category_id: id};
            const category_products = await productOptionCollection.find(query).toArray();
            res.send(category_products);
        });
    }
    finally{
        
    }
}
run().catch(console.log);

 



app.get('/', (req, res) => {
   res.send('Car shop is node mongo API running');
});
 
app.listen(port, () => {
   console.log(`Car Shop Server running on port ${port}`);
})
