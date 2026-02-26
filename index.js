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
    const userCollection = client.db('userDB').collection('users');
    const visaApplicationCollection = client.db('visaApplicationDB').collection('visaApplications');

    app.get('/visas', async (req, res) => {
      // const cursor = visaCollection.find().limit(6);
      const cursor = visaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // app.get('/addedVisas/:id', async (req, res) => {
    app.get('/visas/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await visaCollection.findOne(query);
      res.send(result);
    })

    // app.get('/addedVisas/:email', async (req, res) => {
    app.get('/myVisas/:email', async (req, res) => {
      // app.get('/myVisas/:email/:searchParams', async (req, res) => {
      // app.get('/myVisas', async (req, res) => {
      // app.get('/visas', async (req, res) => {
      const email = req.params.email;
      // const userEmail = req.body?.userEmail;
      // const email = req.body?.email;
      // console.log('email from /myVisas/:email: ', email);
      console.log('email from /myVisas/:email: ', email);
      const query = { email }

      const cursor = visaCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    // app.get('/myVisas/:email/:searchParams', async (req, res) => {
    //   const { searchParams } = req.query;
    //   let option = {};
    //   if (searchParams) {
    //     option = { title: { $regex: true, option: "i" } }
    //   }
    //   console.log(searchParams);
    // })

    app.get('/allVisas/:visaType', async (req, res) => {
      // app.get('/allVisas/:selectedVisaType', async (req, res) => {
      const visaType = req.params.visaType;
      console.log('visaType from allVisas/:visaType:', visaType);
      const query = { selectedVisa: visaType }
      const cursor = visaCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    // app.post('/addedVisas', async (req, res) => {
    app.post('/visas', async (req, res) => {
      const newVisa = req.body;
      console.log('newVisa: ', newVisa);
      const result = await visaCollection.insertOne(newVisa);
      res.send(result);
    })

    // app.put('/addedVisas/:id', async (req, res) => {
    app.put('/visas/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const updatedVisa = req.body;
      const visa = {
        $set: {
          image: updatedVisa.image,
          countryName: updatedVisa.countryName,
          selectedVisa: updatedVisa.selectedVisa,
          time: updatedVisa.time,
          vPassport: updatedVisa.vPassport,
          vApplicationForm: updatedVisa.vApplicationForm,
          rPsPhoto: updatedVisa.rPsPhoto,
          sentence: updatedVisa.sentence,
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

    // app.delete('/addedVisas/:id', async (req, res) => {
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

    // Users applied visas related apis

    app.get('/visaApplications', async (req, res) => {
      const cursor = visaApplicationCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/visaApplications/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = visaApplicationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    // app.get('/users/:email', async (req, res) => { 
    app.get('/myVisaApplications/:email', async (req, res) => {
      const email = req.params.email;
      // console.log('email from /myVisaApplications/:email: ', email);
      const query = { email };
      const cursor = visaApplicationCollection.find(query);
      const result = await cursor.toArray();
      // res.send(result);

      const { searchParams } = req.query;
      // const { searchParams } = result.query;
      // let option = {};
      let searchQuery = {};
      // let searchQuery = result;
      // let option = result;
      // option = {countryName: searchParams};
      // option = {countryName: {$regex: searchParams}};
      if(searchParams) {
        // option = { countryName: { $regex: searchParams, $options: "i" } };
        searchQuery = { countryName: { $regex: searchParams, $options: "i" } };
        const searchCursor = visaApplicationCollection.find(searchQuery);
        // const searchCursor = visaApplicationCollection.find(query).visaApplicationCollection.find(searchQuery);
        // const searchCursor = visaApplicationCollection.find(searchQuery).filter(query);
        // const searchCursor = visaApplicationCollection.find(query).filter(option);
        // const searchCursor = cursor.find(option);
        // const searchCursor = result.find(option);
        const searchResult = await searchCursor.toArray();
        // res.send('searchResult: ', searchResult);
        res.send(searchResult);

        console.log('email from /myVisaApplications/:email & searchParams: ', email, searchParams);
      }
      else {
        // res.send('result: ', result);
        res.send(result);
      }
    })

    // app.post('/users', async (req, res) => {
    app.post('/visaApplications', async (req, res) => {
      const newApplication = req.body;
      console.log('New visa application created: ', newApplication);
      const result = await visaApplicationCollection.insertOne(newApplication);
      res.send(result);
    })

    // app.patch('/users', async (req, res) => {
    // app.patch('/visaApplications', async (req, res) => {
    //   const email = req.body.email;
    //   const filter = { email };
    //   const updatedDoc = {
    //     $set: {
    //       lastSignInTime: req.body?.lastLoginTime
    //     }
    //   }
    //   const result = await visaApplicationCollection.updateOne(filter, updatedDoc);
    //   res.send(result);
    // })

    // app.delete('/users/:id', async (req, res) => {
    app.delete('/visaApplications/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaApplicationCollection.deleteOne(query);
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