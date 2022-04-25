const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

// middleware

app.use(cors());
app.use(express.json());

function verifyJWT (req, res, next){
  
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unauthorized access'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, precess.env.TOKEN, (err, decoded)=>{
    if(err){
      return res.status(403).send({message: 'authorized forbidden'})
    }
    req.decoded = decoded;

    next();
  })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@bappy-practice-db.nb2hg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("GeniusCar").collection("service");
    const orderCollection = client.db("GeniusCar").collection("order");



    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get('/service/:id' , async (req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const service = await serviceCollection.findOne(query);
        res.send(service);
    });
    // post or add data to DB

    app.post('/service', async(req, res)=>{
        const newService = req.body;
        const result = await serviceCollection.insertOne(newService);
        res.send(result);
    });

    // delete item 
    app.delete('/service/:id', async (req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const result = await serviceCollection.deleteOne(query);
        res.send(result);
    });

    // order api
// post or add data into database
    app.post('/order', async (req, res)=>{
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // get all data from db
    app.get('/order', verifyJWT, async (req, res)=>{
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if(email ===decodedEmail){
        const query = {email: email};
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      }
      else{
         res.status(403).send({message: 'authorized forbidden'})
      }
    });


    // auth
    app.post('/login', async (req, res)=>{
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.TOKEN, {expiresIn: '1d'})
      res.send({accessToken});
    })

  } 
  
  finally {

  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Server");
});

app.listen(port, () => {
  console.log("listening to port: ", port);
});
