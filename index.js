require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wy5hpga.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const visaCollection = client.db('visaDB').collection('visas');
    const userCollection = client.db('visaDB').collection('users');

    app.get('/visas', async (req, res) => {
      // const cursor = visaCollection.find().limit(6);
      const cursor = visaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/visas/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await visaCollection.findOne(query);
      res.send(result);
    })

    app.post('/visas', async (req, res) => {
      const newVisa = req.body;
      console.log(newVisa);
      const result = await visaCollection.insertOne(newVisa);
      res.send(result);
    })

    app.put('/visas/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const updatedVisa = req.body;
      const visa = {
        $set: {
          image: updatedVisa.image,
          name: updatedVisa.name,
          selectedVisa: updatedVisa.selectedVisa,
          time: updatedVisa.time,
          documents: updatedVisa.documents,
          description: updatedVisa.description,
          age: updatedVisa.age,
          fee: updatedVisa.fee,
          validity: updatedVisa.validity,
          applicationMethod: updatedVisa.applicationMethod
        }
      }
      const options = { upsert: true };
      const result = await visaCollection.updateOne(query, visa, options);
      res.send(result);
    })

    app.delete('/visas/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.deleteOne(query);
      res.send(result);
    })

    // Users related apis
    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log('New user created: ', newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    app.patch('/users', async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedDoc = {
        $set: {
          lastSignInTime: req.body?.lastLoginTime
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('VISA NAVIGATOR SERVER IS RUNNING')
})

app.listen(port, () => {
  console.log(`Visa navigator is running on port ${port}`)
});