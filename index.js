const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.obhsxav.mongodb.net/?retryWrites=true&w=majority`;

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

		const toyCollection = client.db('toyGaloreDB').collection('toys');

		const indexKeys = { name: 1 };
		const indexOptions = { name: 'name' };
		const result = await toyCollection.createIndex(indexKeys, indexOptions);

		app.get('/toySearchByName/:text', async (req, res) => {
			const searchedName = req.params.text;
			const result = await toyCollection
				.find({
					name: { $regex: searchedName, $options: 'i' },
				})
				.toArray();
			res.send(result);
		});

		app.post('/toys', async (req, res) => {
			const toy = req.body;
			const result = await toyCollection.insertOne(toy);
			res.send(result);
		});

		app.get('/alltoys', async (req, res) => {
			const result = await toyCollection.find().limit(20).toArray();
			res.send(result);
		});

		app.get('/alltoys/:text', async (req, res) => {
			const text = req.params.text;
			if (text == 'car' || text == 'truck' || text == 'sport') {
				const result = await toyCollection
					.find({ subCategory: text })
					.toArray();
				return res.send(result);
			}
			const result = await toyCollection.find({}).toArray();
			res.send(result);
		});

		app.get('/toydetails/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await toyCollection.findOne(query);
			res.send(result);
		});

		app.get('/mytoys/:email', async (req, res) => {
			const email = req.params.email;
			const sortOrder = req.query.sortOrder;

			const result = await toyCollection
				.find({ sellerEmail: email })
				.sort({ price: sortOrder })
				.toArray();

			res.send(result);
		});

		app.put('/updateToy/:id', async (req, res) => {
			const id = req.params.id;
			const data = req.body;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					price: data.price,
					quantity: data.quantity,
					description: data.description,
				},
			};
			const result = await toyCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		app.delete('/deleteToy/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await toyCollection.deleteOne(query);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Server is Running');
});

app.listen(port, () => {
	console.log(`Server is running on port : ${port}`);
});
