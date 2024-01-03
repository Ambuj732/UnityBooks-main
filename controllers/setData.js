const express = require('express');
const bcrypt = require('bcrypt');
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

// Controller functions for setData

exports.address = async (req, res) => {
	const uid = await getUID(req, res);
	let dadd = 1;
	let addName = (req.body.Aname !== null) ? req.body.Aname : "Home";
	db.query('INSERT INTO ADDRESS (UID, ADDNAME, ADD1, ADD2, CITY, STATE, PIN, PHONE, DADD) VALUES (?,?,?,?,?,?,?,?,?)',
		[uid, addName, req.body.A1, req.body.A2, req.body.Acity, req.body.Astate, req.body.Apin, req.body.cPhone, dadd],
		(error, result) => {
			try {
				if (error) errorMsg(res, error, "Internal Server Error", 500, uid);
				else res.status(200).json({ success: "Address added" });
			}
			catch (error) { errorMsg(res, error, "Internal Server Error", 500, uid); }
		}
	);
};

exports.checkCoupons = async (req, res) => {
	const uid = await getUID(req, res);
	let date = new Date();
	date = date.toISOString().slice(0, 19).replace('T', ' ');
	db.query('SELECT * FROM CART WHERE CARTID = ?', [uid], async (error, result) => {
		if (error) errorMsg(res, error, "Internal Server Error", 500, uid);
		db.query('SELECT * FROM COUPON WHERE COUPONID = ?', [result[0].COUPON], async (error, coupon) => {
			if (error) errorMsg(res, error, "Internal Server Error", 500, uid);
			const min = parseInt(coupon[0].MIN);
			const subtotal = parseInt(result[0].SUBTOTAL);
			console.error(subtotal);
			console.error(min);
			if (coupon.length <= 0 || subtotal < min || date > coupon[0].END || date < coupon[0].START) {
				db.query('UPDATE CART SET COUPON = ?, COUPONAMT = 0 WHERE CARTID = ?', [null, uid], async (error, result) => {
					if (error) errorMsg(res, error, "Internal Server Error 3", 500, uid);
					else res.status(200).json({ success: false });
				})
			}
			else res.status(200).json({ success: true, result: coupon });
		});
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