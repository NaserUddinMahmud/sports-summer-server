const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x6lu5yx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const classesCollection = client.db("sportsSummerDB").collection("classes");
    const instructorsCollection = client
      .db("sportsSummerDB")
      .collection("instructors");
    const selectedClassesCollection = client
      .db("sportsSummerDB")
      .collection("selectedClasses");
    const usersCollection = client.db("sportsSummerDB").collection("users");

    // users related APIs
    app.get('/users', async(req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
    })

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already created" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users/instructor/:id', async(req, res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updateDoc = {
            $set: {
              role: 'instructor'
            },
          };
          const result = await usersCollection.updateOne(filter,updateDoc);
          res.send(result)
    })

    //   classes related APIs
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    // instructors related APIs
    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    });

    // selected classes related APIs
    app.get("/selectedClasses", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await selectedClassesCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/selectedClasses", async (req, res) => {
      const item = req.body;
      const result = await selectedClassesCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/selectedClasses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("sports summer is running");
});

app.listen(port, () => {
  console.log(`sports summer is running on port ${port}`);
});
