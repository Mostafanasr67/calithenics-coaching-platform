const User = require("../models/user");
const Test = require("../models/test");
const bcrypt = require("bcryptjs");

exports.getClients = async (req, res, next) => {
	try {
		// Return all users with role 'client'
		const clients = await User.find({ role: "client" }).select("-password");
		
		res.status(200).json(clients);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.createClient = async (req, res, next) => {
	try {
		const {
			name,
			email,
			age,
			weight,
			height,
			primaryGoal,
			secondaryGoal,
			startDate,
			duration,
			status,
			maxMuscleUps,
			maxDips,
			maxPullUps,
			maxPushUps,
			oneRepMaxMuscleUps,
			oneRepMaxDips,
			oneRepMaxPullUps,
		} = req.body;

		// If email provided, check uniqueness
		if (email) {
			const existingUser = await User.findOne({ email: email });
			if (existingUser) {
				const error = new Error("E-Mail address already exists!");
				error.statusCode = 422;
				throw error;
			}
		}

		// Hash default password "12345"
		const defaultPassword = "12345";
		const hashedPw = await bcrypt.hash(defaultPassword, 12);

		// Create new client user
		const client = new User({
			name: name,
			email: email,
			password: hashedPw,
			age: age,
			weight: weight,
			height: height,
			primaryGoal: primaryGoal,
			secondaryGoal: secondaryGoal,
			status: status || "Active",
			startDate: startDate,
			duration: duration,
			role: "client",
		});

		// If performance/test fields provided, create Test doc and link
		if (
			typeof maxMuscleUps !== 'undefined' ||
			typeof maxDips !== 'undefined' ||
			typeof maxPullUps !== 'undefined' ||
			typeof maxPushUps !== 'undefined' ||
			typeof oneRepMaxMuscleUps !== 'undefined' ||
			typeof oneRepMaxDips !== 'undefined' ||
			typeof oneRepMaxPullUps !== 'undefined'
		) {
			const test = new Test({
				maxMuscleUps: maxMuscleUps || 0,
				maxDips: maxDips || 0,
				maxPullUps: maxPullUps || 0,
				maxPushUps: maxPushUps || 0,
				oneRepMaxMuscleUps: oneRepMaxMuscleUps || 0,
				oneRepMaxDips: oneRepMaxDips || 0,
				oneRepMaxPullUps: oneRepMaxPullUps || 0,
			});
			const savedTest = await test.save();
			client.test = savedTest._id;
		}

		const result = await client.save();
		console.log("Client created successfully:", result._id);
		res.status(201).json({ 
			message: "Client created!", 
			clientId: result._id,
			tempPassword: defaultPassword
		});
	} catch (err) {
		console.error("Error creating client:", err.message);
		console.error("Full error:", err);
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getClientById = async (req, res, next) => {
	try {
		const clientId = req.params.id;
		
		const client = await User.findById(clientId)
			.select("-password")
			.populate({
				path: 'test',
				options: { strictPopulate: false }
			});
		

		if (!client) {
			const error = new Error("Client not found.");
			error.statusCode = 404;
			throw error;
		}

		res.status(200).json(client);
	} catch (err) {
		console.error("Error fetching client:", err.message, err.stack);
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateClient = async (req, res, next) => {
	try {
		const clientId = req.params.id;
		const client = await User.findById(clientId);

		if (!client) {
			const error = new Error("Client not found.");
			error.statusCode = 404;
			throw error;
		}
		// Update client fields (apply any provided fields)
		const {
			name,
			email,
			age,
			weight,
			height,
			primaryGoal,
			secondaryGoal,
			status,
			startDate,
			duration,
			maxMuscleUps,
			maxDips,
			maxPullUps,
			maxPushUps,
			oneRepMaxMuscleUps,
			oneRepMaxDips,
			oneRepMaxPullUps,
		} = req.body;
		if (name !== undefined) client.name = name;
		if (email !== undefined) client.email = email;
		if (age !== undefined) client.age = age;
		if (weight !== undefined) client.weight = weight;
		if (height !== undefined) client.height = height;
		if (primaryGoal !== undefined) client.primaryGoal = primaryGoal;
		if (secondaryGoal !== undefined) client.secondaryGoal = secondaryGoal;
		if (status !== undefined) client.status = status;
		// store optional meta fields if provided
		if (startDate !== undefined) client.startDate = startDate;
		if (duration !== undefined) client.duration = duration;

		// Handle test/performance fields: update existing Test or create one
		if (
			typeof maxMuscleUps !== 'undefined' ||
			typeof maxDips !== 'undefined' ||
			typeof maxPullUps !== 'undefined' ||
			typeof maxPushUps !== 'undefined' ||
			typeof oneRepMaxMuscleUps !== 'undefined' ||
			typeof oneRepMaxDips !== 'undefined' ||
			typeof oneRepMaxPullUps !== 'undefined'
		) {
			if (client.test) {
				const testDoc = await Test.findById(client.test);
				if (testDoc) {
					if (maxMuscleUps !== undefined) testDoc.maxMuscleUps = maxMuscleUps;
					if (maxDips !== undefined) testDoc.maxDips = maxDips;
					if (maxPullUps !== undefined) testDoc.maxPullUps = maxPullUps;
					if (maxPushUps !== undefined) testDoc.maxPushUps = maxPushUps;
					if (oneRepMaxMuscleUps !== undefined) testDoc.oneRepMaxMuscleUps = oneRepMaxMuscleUps;
					if (oneRepMaxDips !== undefined) testDoc.oneRepMaxDips = oneRepMaxDips;
					if (oneRepMaxPullUps !== undefined) testDoc.oneRepMaxPullUps = oneRepMaxPullUps;
					await testDoc.save();
				}
			} else {
				const newTest = new Test({
					maxMuscleUps: maxMuscleUps || 0,
					maxDips: maxDips || 0,
					maxPullUps: maxPullUps || 0,
					maxPushUps: maxPushUps || 0,
					oneRepMaxMuscleUps: oneRepMaxMuscleUps || 0,
					oneRepMaxDips: oneRepMaxDips || 0,
					oneRepMaxPullUps: oneRepMaxPullUps || 0,
				});
				const saved = await newTest.save();
				client.test = saved._id;
			}
		}

		const result = await client.save();
		res.status(200).json({ message: "Client updated!", client: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteClient = async (req, res, next) => {
	try {
		const clientId = req.params.id;
		const client = await User.findById(clientId);

		if (!client) {
			const error = new Error("Client not found.");
			error.statusCode = 404;
			throw error;
		}
		await client.deleteOne();
		await Test.deleteOne({ _id: client.test }); // Delete associated Test document if it exists
		res.status(200).json({ message: "Client deleted." });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};