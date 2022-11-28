const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next){
    // console.log('token inside verifyJWT', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })

}

async function run(){
    try{
        categoryOptionCollection = client.db('carShop').collection('categories');
        productOptionCollection = client.db('carShop').collection('products');
        productCollection = client.db('carShop').collection('product');
        usersCollection = client.db('carShop').collection('users');

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

        app.get('/product', async(req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            
            // if(email !== decodedEmail){
            //     return res.status(403).send({message: 'forbidden access'});
            // }

            const query = {email: email};
            const product = await productCollection.find(query).toArray();
            res.send(product);
        }) 

        app.post('/product', async(req, res) => {
            const produc = req.body;
            console.log(produc);
            const result = await productCollection.insertOne(produc);
            res.send(result);
        });

        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''})
        });

        app.get('/users', async(req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.rol === 'admin'});
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }


            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const options = {upsert: true};
            const updatedDoc = {
                $set: {
                    rol: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
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
