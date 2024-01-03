const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const mysql = require('mysql');
const bodyParser = require("body-parser");
const fs = require('fs');


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

exports.addToCart = (req, res) => {
	let pid = req.body.pid;
	let qty = req.body.qty;
	let uid = getUID(req, res);
	try {
		db.query("CALL add_cart_item(?, ?, ?);", [uid, pid, qty], (error, result) => {
			if (error) {
				console.log(error);
				return res.status(500).send({
					success: false,
					error: error
				});
			}
			else {
				return res.status(200).send({
					success: true,
				});
			}
		})
	} catch (error) {
		console.log(error);
		return res.status(401).send({
			success: false,
			error: error
		});
	}
}

exports.getCart = (req, res) => {
	let uid = getUID(req, res);
	try {
		db.query("SELECT * FROM CART WHERE CARTID = ?", [uid], (error, result) => {
			if (error) {
				console.log(error);
				return res.status(500).send({
					success: false,
					error: error
				});
			}
			if (result[0].ITEMS > 0) {
				db.query("SELECT * FROM CART_ITEM WHERE CARTID = ?", [uid], (error, items) => {
					if (error) {
						console.log(error);
						return res.status(500).send({
							success: false,
							error: error
						});
					}
					else {
						let products = [];
						items.forEach(item => {
							db.query("SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;", [item.PID], (error, product) => {
								if (error) {
									console.log(error);
									return res.status(500).send({
										success: false,
										error: error
									});
								}
								products.push(product[0]);
							})
						});
						return res.status(200).send({
							success: true,
							cart: result,
							cartItems: items,
							products: products
						});
					}
				})
			}
			else if (result[0].ITEMS == 0 && result.length > 0) {
				return res.status(200).send({
					success: true,
					cart: result,
					cartItems: null,
					products: null
				});
			}
		})
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			success: false,
			error: error
		});
	}
}

exports.getUID = async (req, res) => {
	if (req.cookies.log) {
		console.log(req.cookies.log);
		try {
			const decode = await promisify(jwt.verify)(
				req.cookies.log,
				process.env.JWT_SECRET
			);
			const uid = decode.id;
			return uid;
		} catch (error) {
			console.log(error);
			res.status(200).redirect('/signin');
		}
	} else {
		res.status(200).redirect('/signin');
	}
};