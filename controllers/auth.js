const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const mysql = require('mysql');
const bodyParser = require("body-parser");


express().use(bodyParser.urlencoded({
	extended: true
}));

express().use(bodyParser.json());

//dotenv config
dotenv.config({ path: './.env' });

const db = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE,
});

exports.login = (req, res) => {
	const email = req.body.cEmail;
	const password = req.body.pass;

	if (!email || !password) {
		console.error("Please Enter Your Email and Password");
		const msg = "Please Enter Your Email and Password";
		return res.status(400).send({
			error: msg
		});
	}

	db.query(
		"select * from USERS where EMAIL=?", [email], (error, result) => {
			if (error) {
				console.error(error);
				const msg = "Internal Server Error 1";
				return res.status(500).send({
					error: msg
				});
			}
			if (result.length <= 0) {
				console.error("Wrong Email");
				const msg = "Wrong Email";
				return res.status(400).send({
					error: msg
				});
			} else {
				const pass = result[0].PASSWORD;
				bcrypt.compare(password, pass)
					.then((passwordMatch) => {
						if (!passwordMatch) {
							console.error("Wrong Password");
							const msg = "Wrong Password";
							return res.status(401).send({
								error: msg
							});
						}
						else {
							if (!pass) {
								console.error("Wrong Password");
								const msg = "Wrong Password";
								return res.status(401).send({
									error: msg
								});
							} else {
								const id = result[0].UID;
								const name = result[0].NAME;
								const token = jwt.sign({ id: id, name: name, email: email }, process.env.JWT_SECRET, {
									expiresIn: process.env.JWT_EXPIRES_IN,
								});

								try {
									db.query("UPDATE USERS SET LOGIN = CURRENT_TIMESTAMP WHERE UID=?", [id], (error, result) => {
										if (error) {
											console.error(error);
										}
									})
								}
								catch (error) {
									console.error(error);
								}

								const cookieOptions = {
									expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
									httpOnly: true,
								};
								res.cookie("isLoggedIn", "true", { expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000), httpOnly: false });
								res.status(200).cookie("UnityLog", token, cookieOptions).redirect('/');
							}
						}
					})
					.catch((error) => {
						console.error(error);
						const msg = "Internal Server Error 2";
						return res.status(500).send({
							error: msg
						});
					});
			}
		}
	);
}

exports.isLoggedIn = async (req, res, next) => {
	// req.name = "Check Login....";
	// console.log("req.cookies: ", req.cookies);
	if (req.cookies.UnityLog) {
		try {
			const decode = await promisify(jwt.verify)(
				req.cookies.log,
				process.env.JWT_SECRET
			);
			// console.log(decode);
			db.query(
				"select * from USERS where UID=?",
				[decode.id],
				(err, results) => {
					// console.log(results);
					if (!results) {
						return next();
					}
					req.user = results[0];
					return next();
				}
			);
		} catch (error) {
			console.log(error);
			return next();
		}
	} else {
		next();
	}
};

exports.code = (req, res) => {
	var referral = req.body.id;
	if (referral == "YT100" || referral == "IG100" || referral == "TW100" || referral == "FB100") {
		const x = 1;
		return res.json({ x });
	}
	var nameField = referral.slice(0, 2);
	var id = referral.slice(2);
	db.query('SELECT NAME FROM USERS WHERE UID = ?', [id], async (err, result) => {
		try {
			var name = result[0].NAME;
			if (name.slice(0, 2).toUpperCase() == nameField) {
				const x = 1;
				return res.json({ x });
			}
			else {
				const x = 0;
				return res.json({ x });
			}
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		}
	});
}

exports.signup = (req, res) => {
	db.query(
		"select EMAIL from USERS where EMAIL=?", [req.body.cEmail], async (error, result) => {
			if (error) {
				console.error(error);
			}
			if (result.length > 0) {
				console.error("Account already exists");
				const msg = "Account already exists";
				return res.status(401).send({
					error: msg
				});
			}
			let hashedPassword = (req.body.pass !== null) ? await bcrypt.hash(req.body.pass, 12) : null;
			const email = req.body.cEmail;
			const uname = req.body.cName;

			let stype = 0;

			db.query('INSERT INTO USERS (NAME, PHONE, EMAIL, PASSWORD, WALLET, RCODE, REFERRER, SELLER_TYPE) VALUES (?,?,?,?,?,?,?,?)',
				[req.body.cName, req.body.cPhone, req.body.cEmail, hashedPassword, 0, null, null, stype],
				(error, result) => {
					try {
						if (error) {
							console.error(error);
							res.status(500).json({ error: "Internal Sever Error 1" });
						}
						else {
							const uid = result.insertId;
							db.query('INSERT INTO CART (CARTID) VALUES (?)', [uid], (error, result) => {
								if (error) {
									console.error(error);
									res.status(500).json({ error: "Internal Sever Error 2" });
								}
								const token = jwt.sign({ id: uid, name: uname, email: email }, process.env.JWT_SECRET, {
									expiresIn: process.env.JWT_EXPIRES_IN,
								});
								// console.error("The Token is " + token);
								const cookieOptions = {
									expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
									httpOnly: true,
								};

								res.cookie("isLoggedIn", "true", { expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000), httpOnly: false });
								res.status(200).cookie("UnityLog", token, cookieOptions).redirect("/");
							})
						}
					}
					catch (error) {
						console.error(error);
						res.status(500).json({ error: 'Internal server error 3' });
					}
				})
		}
	);
}

exports.signout = (req, res) => {
	res.cookie("UnityLog", "logout", {
		expires: new Date(Date.now() + 2 * 1000),
		httpOnly: true,
	});
	res.cookie("isLoggedIn", "", {
		expires: new Date(Date.now() + 2 * 1000),
	})
	res.status(200).redirect("/login");
}