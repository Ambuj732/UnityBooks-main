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

// Gets all the products and its details
exports.products = (req, res) => {
	try {
		db.query("SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID;",
			(error, result) => {
				if (error) {
					console.error(error);
					const msg = "Internal Server Error";
					return res.status(500).send({
						error: msg
					});
				}
				if (result.length <= 0) {
					console.error("No Products Found");
					const msg = "No Products Found";
					return res.status(404).send({
						error: msg
					});
				}
				else {
					return res.status(200).send({
						products: result,
						noOfProducts: result.length,
					})
				}
			}
		)
	} catch (error) {
		console.error(error);
		const msg = "Internal Server Error";
		return res.status(500).send({
			error: msg
		});
	}
}

exports.prodcat = async (req, res) => {
	const category = req.body.category;
	db.query("SELECT CATID FROM CATEGORY WHERE NAME = ?", [category], async (error, result) => {
		if (error) errorMsg(res, error, "Internal Server Error", 500, null);
		if (result.length <= 0) errorMsg(res, null, "No Category Found", 404, null);
		else if (result[0].CATID === 34) {
			let products = [];
			const bestsellersId = [87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111];
			const queries = bestsellersId.map(catid => {
				return new Promise((resolve, reject) => {
					db.query("SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID JOIN PROD_CAT PC ON I.BID = PC.BID WHERE PC.CATID = ?;", [catid], (error, product) => {
						if (error) reject(error);
						else resolve(product[0]);
					});
				});
			});

			try {
				const products = await Promise.all(queries);
				return res.status(200).send({
					products: products,
					noOfProducts: 25,
				});
			} catch (error) { errorMsg(res, null, "No Product Found", 404, null); }
		}
		else {
			const catid = result[0].CATID;
			try {
				db.query("SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID JOIN PROD_CAT PC ON I.BID = PC.BID WHERE PC.CATID = ? ORDER BY I.BID DESC;",
					[catid], (error, result) => {
						if (error) errorMsg(res, error, "Internal Server Error", 500, null);
						if (result.length <= 0) errorMsg(res, null, "No Product Found", 404, null);
						else {
							return res.status(200).send({
								products: result,
								noOfProducts: result.length,
							})
						}
					}
				)
			} catch (error) { errorMsg(res, null, "No Product Found", 404, null); }
		}
	});
}

exports.categories = (req, res) => {
	try {
		db.query("SELECT * FROM CATEGORY WHERE IMG IS NOT NULL AND CATID != 35 ORDER BY CATID;", (error, result) => {
			if (error) {
				console.error(error);
				const msg = "Internal Server Error";
				return res.status(500).send({
					error: msg
				});
			}
			if (result.length <= 0) {
				console.error("No Categories Found");
				const msg = "No Categories Found";
				return res.status(404).send({
					error: msg
				});
			}
			else {
				return res.status(200).send({
					categories: result,
					noOfCategories: result.length,
				})
			}
		})
	} catch (error) {
		console.error(error);
		const msg = "Internal Server Error";
		return res.status(500).send({
			error: msg
		});
	}
}

exports.authors = (req, res) => {
	try {
		db.query("SELECT CATID, NAME, IMG FROM CATEGORY WHERE PARENT = 35 ORDER BY CATID;", (error, result) => {
			if (error) {
				console.error(error);
				const msg = "Internal Server Error";
				return res.status(500).send({
					error: msg
				});
			}
			if (result.length <= 0) {
				console.error("No Categories Found");
				const msg = "No Categories Found";
				return res.status(404).send({
					error: msg
				});
			}
			else {
				return res.status(200).send({
					authors: result,
					noOfAuthors: result.length,
				})
			}
		})
	} catch (error) {
		console.error(error);
		const msg = "Internal Server Error";
		return res.status(500).send({
			error: msg
		});
	}
}

exports.search = async (req, res) => {
	const searchString = req.body.search;
	try {
		db.query(`
		SELECT DISTINCT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, 
			B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, 
			B.PAGES, B.WEIGHT, B.REVIEW, 
			MATCH(B.NAME, B.AUTHOR, B.DESCRIPTION) AGAINST (? IN BOOLEAN MODE) AS relevance
		FROM INVENTORY I
		JOIN BOOKS B ON I.BID = B.BID
		JOIN PROD_CAT PC ON I.BID = PC.BID
		WHERE MATCH(B.NAME, B.AUTHOR, B.DESCRIPTION) AGAINST (? IN BOOLEAN MODE)
			AND (B.NAME LIKE ? OR B.AUTHOR LIKE ?)
		ORDER BY relevance DESC;`, [searchString, searchString, `%${searchString}%`, `%${searchString}%`],
			(error, products) => {
				if (error) {
					console.error(error);
					const msg = "Internal Server Error";
					return res.status(500).send({ error: msg });
				}

				if (products.length <= 0) {
					console.error("No Products Found");
					const msg = "No Products Found";
					return res.status(404).send({ error: msg });
				}

				return res.status(200).send({
					products: products,
					noOfProducts: products.length,
				});
			});
	} catch (error) {
		console.error(error);
		const msg = "Internal Server Error";
		return res.status(500).send({ error: msg });
	}
};

exports.coupons = async (req, res) => {
	try {
		const date = new Date();
		date.setTime(date.getTime() + (5.5 * 60 * 60 * 1000));
		const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
		db.query("SELECT * FROM COUPON WHERE END >= ? AND START <= ? ORDER BY END;", [formattedDate, formattedDate], (error, result) => {
			if (error) {
				console.error(error);
				const msg = "Internal Server Error";
				return res.status(500).send({
					success: false,
					error: msg
				});
			}
			if (result.length <= 0) {
				console.error("No Coupons Found");
				const msg = "No Coupons Found";
				return res.status(404).send({
					success: false,
					error: msg
				});
			}
			else {
				return res.status(200).send({
					success: true,
					coupons: result,
					noOfCoupons: result.length,
				})
			}
		})
	} catch (error) {
		console.error(error);
		const msg = "Internal Server Error";
		return res.status(500).send({
			error: msg
		});
	}
}

exports.address = async (req, res) => {
	const uid = await getUID(req, res);
	db.query('SELECT * FROM ADDRESS WHERE UID = ?', [uid], (error, result) => {
		if (error) errorMsg(res, error, "Internal Server Error", 500, uid);
		else if (result.length <= 0) res.status(401).redirect("/addAddress");
		else res.status(200).json({ success: true, address: result });
	})
}



/**
 * Retrieves the user ID (UID) from the decoded JWT token stored in the UnityLog cookie.
 *
 * If the UnityLog cookie is present, it decodes the JWT token using the JWT secret and retrieves the UID from it.
 * If the decoding is successful, it returns the UID.
 * If there is an error while decoding the token, it logs the error and redirects to the login page with a status 401.
 * If the UnityLog cookie is not present, it redirects to the login page with a status 401.
 * 
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {number} - the user ID (UID)
 */
const getUID = async (req, res) => {
	if (req.cookies.UnityLog) {
		try {
			const decode = await promisify(jwt.verify)(
				req.cookies.UnityLog,
				process.env.JWT_SECRET
			);
			const uid = parseInt(decode.id);
			return uid;
		} catch (error) {
			errorMsg(res, error, "Internal Server Error", 500, id);
			res.status(401).redirect("/login");
		}
	} else {
		res.status(401).redirect("/login");
	}
};

/**
 * Logs an error message with the timestamp and user ID in the server error log file which is at
 * /home/unitybo1/app/stderr.log and sends a response with the specified status and error message.
 *
 * @param {Error} error - The Exception/Error object for the error occurred.
 * @param {string} msg - The custom error message to be sent in the response.
 * @param {number} status - The HTTP status code to be set in the response.
 * @param {number} uid - The User ID (UID) of the user facing the error.
 * @param {Response} res - The response object.
 * @return {Response} The response object with the specified status code and error message.
 */
const errorMsg = async (res, error, msg, status, uid) => {
	const currDate = new Date();
	const logInfo = `UID: ${uid} \tTime: ${currDate.getDate()}/${currDate.getMonth() + 1}/${currDate.getFullYear()} ${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}\n\nError: `;
	(error !== null) ? console.error(`\n${logInfo}${error}\n`) : console.error(`\n${logInfo}${msg}\n`);
	return res.status(status).json({
		success: false,
		error: msg
	});
}