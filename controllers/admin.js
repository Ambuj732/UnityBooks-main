const express = require("express");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const mysql = require("mysql");
const bodyParser = require("body-parser");

express().use(
  bodyParser.urlencoded({
    extended: true,
  })
);

express().use(bodyParser.json()); // data of cunstomer handle.

//dotenv config
dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
});

// Controller functions for Admin dashboard

/**
 * Authenticates the user login by checking the email and password provided.
 *
 * If the email or password are missing, it returns an error response with status 400.
 * If there is an error while querying the database, it returns an error response with status 500.
 * If the email does not exist in the database, it returns an error response with status 400.
 * If the user does not have a seller account, it returns an error response with status 400.
 * If the password is incorrect, it returns an error response with status 401.
 * If all checks pass, it generates a JWT token, updates the user's login timestamp in the database,
 * sets the token as a cookie, and redirects the user to the admin dashboard with a status 200.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {JSON} - sends a success JSON which redirects the user to the admin dashboard
 */
exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password)
    errorMsg(res, null, "Please Enter Your Email and Password", 400, null);

  db.query(
    "select * from USERS U JOIN SELLER S ON U.UID = S.SID where U.EMAIL=?",
    [email],
    (error, result) => {
      if (error) errorMsg(res, error, "Internal Server Error", 500, null);
      if (result.length <= 0)
        errorMsg(res, null, "Wrong Email Address", 400, null);
      const pass = result[0].PASSWORD;
      const id = parseInt(result[0].UID);
      const name = result[0].SELLER_NAME;
      const type = parseInt(result[0].TYPE);
      if (type === 0 || type === null)
        errorMsg(res, null, "Seller Account not Available", 400, id);
      else {
        bcrypt
          .compare(password, pass)
          .then((passwordMatch) => {
            if (!passwordMatch) errorMsg(res, null, "Wrong Password", 400, id);
            else {
              const token = jwt.sign(
                { id: id, name: name, type: type },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
              );

              try {
                db.query(
                  "UPDATE USERS SET LOGIN = CURRENT_TIMESTAMP WHERE UID=?",
                  [id],
                  (error, result) => {
                    if (error)
                      errorMsg(
                        res,
                        error,
                        "Internal Server Error - Failed to update login",
                        500,
                        id
                      );
                  }
                );
              } catch (error) {
                errorMsg(
                  res,
                  error,
                  "Internal Server Error - Failed to update login",
                  500,
                  id
                );
              }

              const cookieOptions = {
                expires: new Date(
                  Date.now() +
                    process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: false,
              };
              res.status(200).cookie("admin", token, cookieOptions);
              return res.status(200).json({ success: true });
            }
          })
          .catch((error) => {
            errorMsg(
              res,
              error,
              "Internal Server Error - Failed to compare password",
              500,
              id
            );
          });
      }
    }
  );
};

/**
 * Checks if a user is logged in.
 *
 * Checks if the admin cookie is present in the request cookies to check if logged in.
 * If the user is logged in, goes to the next middleware function.
 * If the user is not logged in, it redirects the user to the login page.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @return {Response}
 */
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.admin) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.admin,
        process.env.JWT_SECRET
      );
      const sid = parseInt(decode.id);
      const type = parseInt(decode.type);
      db.query(
        "SELECT * from USERS WHERE UID=?",
        [sid],
        async (err, result) => {
          if (!result || type === 0) return res.redirect("/admin/signin"); // Redirect to signin if not logged in
          req.user = result[0];
          return next();
        }
      );
    } catch (error) {
      errorMsg(res, error, "Unauthorized", 401, id);
      return next();
    }
  } else return res.redirect("/admin/signin"); // Redirect to signin if not logged in
};

/**
 * Signs out the user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Response} Redirects the user to the login page.
 */
exports.signout = (req, res) => {
  res.cookie("admin", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: false,
  });
  res.status(200).redirect("/admin/login");
};

exports.profile = async (req, res) => {
  const sid = await getUID(req, res);
};

/**
 * Retrieves the orders for a specific seller and fetches the associated order items and products.
 *
 * If there is an error while querying the database, it returns an error response with status 500.
 * If there are no orders for the seller, it returns a success response with status 200 and empty order items and products.
 * If there are orders for the seller, it retrieves the order items and products associated with each order, and returns a
 * success response with status 200, along with the orders, order items, and products.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Response} - the response object with the orders, order items, and products
 */
exports.order = async (req, res) => {
  const sid = await getUID(req, res);
  db.query(
    "select * from ORDERS where SELLER=? ORDER BY OID DESC",
    [sid],
    async (error, orders) => {
      if (error) errorMsg(res, error, "Internal Server Error", 500, sid);
      else if (orders.length <= 0) {
        return res.status(200).send({
          success: true,
          orders: orders,
          orderItems: null,
          products: null,
        });
      } else {
        // Use Promise.all to wait for all the queries to complete
        const orderItemQueries = orders.map((order) => {
          return new Promise((resolve, reject) => {
            db.query(
              "SELECT * FROM ORDER_ITEM WHERE OID = ?",
              [order.OID],
              (error, items) => {
                if (error) {
                  errorMsg(res, error, "Internal Server Error", 500, id);
                  reject(error);
                } else resolve(items);
              }
            );
          });
        });

        const items = await Promise.all(orderItemQueries);

        // Fetch products for each item using another Promise.all
        const productQueries = items.map((orderItems) => {
          return Promise.all(
            orderItems.map((item) => {
              return new Promise((resolve, reject) => {
                db.query(
                  "SELECT * FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;",
                  [item.PID],
                  (error, product) => {
                    if (error) {
                      errorMsg(res, error, "Internal Server Error", 500, id);
                      reject(error);
                    } else resolve(product[0]);
                  }
                );
              });
            })
          );
        });

        const products = await Promise.all(productQueries);

        return res.status(200).json({
          success: true,
          orders: orders,
          orderItems: items,
          products: products,
        });
      }
    }
  );
};

/**
 * Retrieves all the users from the database.
 *
 * If there is an error while querying the database, it returns an error response with status 500.
 * If the query is successful, it returns a success response with status 200 and the list of users.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Response} - the response object with the list of all users and the users' data
 */
exports.users = async (req, res) => {
  // const sid = 1;
  const sid = await getUID(req, res);
  db.query("select * from USERS", (error, result) => {
    if (error) errorMsg(res, error, "Internal Server Error", 500, sid);
    else {
      return res.status(200).json({
        success: true,
        users: result,
      });
    }
  });
};

/**
 * Retrieves all the products from the database.
 *
 * If there is an error while querying the database, it returns an error response with status 500.
 * If there are no products found, it returns an error response with status 404.
 * If the query is successful and products are found, it returns a success response with status 200
 * along with the list of products and the number of products.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} A promise that resolves to the retrieved products or an error message.
 */
exports.products = async (req, res) => {
  try {
    const sid = await getUID(req, res);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID ORDER BY I.PID DESC;",
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    if (result.length <= 0) errorMsg(res, null, "No Products Found", 404, sid);
    else {
      return res.status(200).json({
        success: true,
        products: result,
        noOfProducts: result.length,
      });
    }
  } catch (error) {
    errorMsg(res, error, "Internal Server Error", 500, sid);
  }
};

/**
 * Retrieves a product from the inventory based on the provided product ID.
 *
 * If there is an error while querying the database, it returns an error response with status 500.
 * If there is no product with the given pid, it returns an error response with status 404.
 * If the query is successful and product is found then it searches for its categories and then it
 * returns a success response with status 200 along with the list of parameters of the product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} A promise that resolves to the retrieved product or an error message.
 */
exports.product = async (req, res) => {
  const pid = req.body.pid;
  try {
    const sid = await getUID(req, res);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;",
        [pid],
        async (error, result) => {
          if (error) reject(error);
          else {
            try {
              const categories = await new Promise(
                (resolveCategories, rejectCategories) => {
                  db.query(
                    "SELECT C.* FROM PROD_CAT PC JOIN CATEGORY C ON PC.CATID = C.CATID WHERE PC.BID = ?;",
                    [result[0].BID],
                    (categoriesError, categoriesResult) => {
                      if (categoriesError) rejectCategories(categoriesError);
                      else resolveCategories(categoriesResult);
                    }
                  );
                }
              );

              resolve({ product: result, categories });
            } catch (categoriesError) {
              reject(categoriesError);
            }
          }
        }
      );
    });

    if (result.product.length <= 0)
      errorMsg(res, null, "No Products Found", 404, sid);
    else {
      return res.status(200).json({
        success: true,
        product: result.product,
        categories: result.categories,
      });
    }
  } catch (error) {
    errorMsg(res, error, "Internal Server Error", 500, sid);
  }
};

/**
 * Updates the product details in the inventory and books tables.
 *
 * fetches the product details and categories from the request body and updates the product details in the INVENTORY table.
 * If product details are updated then it fetches the categories associated with the product
 * and checks for newly added categories and removed categories using filter.
 * If there are any newly added categories and removed categories, it updates the categories in the PROD_CAT table
 * If there are no errors, it returns a success response with status 200.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise<void>} - a promise that resolves when the product details are updated
 */
exports.editProduct = async (req, res) => {
  let {
    pid,
    name,
    isbn,
    author,
    format,
    language,
    condition,
    mrp,
    cp,
    sp,
    discount,
    quantity,
    pages,
    weight,
    description,
    category,
    bid,
    img,
  } = req.body;
  const sid = await getUID(req, res);
  try {
    // Update the product details using promise
    const products = await new Promise((resolve, reject) => {
      db.query(
        "UPDATE INVENTORY SET COND = ?, QTY = ?, CP = ?, SP = ?, DISCOUNT = ?, LANG = ? WHERE PID = ?;",
        [condition, quantity, cp, sp, discount, language, pid],
        async (error, result) => {
          if (error) {
            errorMsg(
              res,
              error,
              "Internal Server Error - Update INVENTORY",
              500,
              sid
            );
            reject(error);
          } else {
            try {
              db.query(
                "UPDATE BOOKS SET NAME = ?, ISBN = ?, AUTHOR = ?, FORMAT = ?, PAGES = ?, WEIGHT = ?, DESCRIPTION = ?, MRP = ?, IMG = ? WHERE BID = ?;",
                [
                  name,
                  isbn,
                  author,
                  format,
                  pages,
                  weight,
                  description,
                  mrp,
                  img,
                  bid,
                ],
                async (error1, result1) => {
                  if (error1) {
                    errorMsg(
                      res,
                      error1,
                      "Internal Server Error - Update BOOKS",
                      500,
                      sid
                    );
                    reject(error1);
                  } else resolve(result1);
                }
              );
            } catch (error1) {
              errorMsg(
                res,
                error1,
                "Internal Server Error - Update BOOKS",
                500,
                sid
              );
              reject(error1);
            }
          }
        }
      );
    });

    // Fetching the categories associated with the old product
    const categories = await new Promise(
      (resolveCategories, rejectCategories) => {
        db.query(
          "SELECT C.* FROM PROD_CAT PC JOIN CATEGORY C ON PC.CATID = C.CATID WHERE PC.BID = ?;",
          [bid],
          (categoriesError, categoriesResult) => {
            if (categoriesError) rejectCategories(categoriesError);
            else resolveCategories(categoriesResult);
          }
        );
      }
    );

    const currentCategories = categories.map((cat) => cat.NAME);

    // Find newly added categories
    const addedCategories = category.filter(
      (newCategory) => !currentCategories.includes(newCategory)
    );

    // Find removed categories
    const removedCategories = currentCategories.filter(
      (currentCategory) => !category.includes(currentCategory)
    );

    console.error(currentCategories);
    console.error(category);
    console.error(addedCategories);
    console.error(removedCategories);

    // Remove categories that are no longer associated with the product
    for (const removedCategory of removedCategories) {
      await new Promise((resolveRemove, rejectRemove) => {
        db.query(
          "DELETE FROM PROD_CAT WHERE BID = ? AND CATID = (SELECT CATID FROM CATEGORY WHERE NAME = ?);",
          [bid, removedCategory],
          (removeError, removeResult) => {
            if (removeError) rejectRemove(removeError);
            else resolveRemove();
          }
        );
      });
    }

    // Add newly added categories to the product
    for (const addedCategory of addedCategories) {
      await new Promise((resolveAdd, rejectAdd) => {
        db.query(
          "INSERT INTO PROD_CAT (BID, CATID) VALUES (?, (SELECT CATID FROM CATEGORY WHERE NAME = ?));",
          [bid, addedCategory],
          (addError, addResult) => {
            if (addError) rejectAdd(addError);
            else resolveAdd();
          }
        );
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    errorMsg(res, error, "Internal Server Error", 500, sid);
  }
};

/**
 * Adds a product to the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} A promise that resolves when the product is added successfully.
 */
exports.addProduct = async (req, res) => {
  let {
    name,
    isbn,
    author,
    format,
    language,
    condition,
    mrp,
    cp,
    sp,
    discount,
    quantity,
    pages,
    weight,
    description,
    category,
    img,
  } = req.body;
  const sid = await getUID(req, res);
  const role = await getRole(req, res);
  const review = role === 4 ? 1 : 0;
  try {
    // Check if a book with the same ISBN and FORMAT already exists inside the bid promise
    const existingBook = await new Promise((resolve, reject) => {
      db.query(
        "SELECT BID FROM BOOKS WHERE ISBN = ? AND FORMAT = ? LIMIT 1;",
        [isbn, format],
        (error, result) => {
          if (error) reject(error);
          else resolve(result[0]); // Returns the first matching book or null if none found
        }
      );
    });

    // console.error(existingBook);
    let bid;

    // If a matching book exists, use its BID. If no matching book exists, insert a new book and get its BID
    if (existingBook) bid = existingBook.BID;
    else {
      bid = await new Promise(async (resolve, reject) => {
        db.query(
          "INSERT INTO BOOKS (ISBN, NAME, MRP, DESCRIPTION, AUTHOR, FORMAT, PAGES, WEIGHT, REVIEW, IMG) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
          [
            isbn,
            name,
            mrp,
            description,
            author,
            format,
            pages,
            weight,
            review,
            img,
          ],
          async (error, result) => {
            if (error) {
              errorMsg(
                res,
                error,
                "Internal Server Error - Add BOOKS",
                500,
                sid
              );
              reject(error);
            } else {
              for (const addedCategory of category) {
                db.query(
                  "INSERT INTO PROD_CAT (BID, CATID) VALUES (?, (SELECT CATID FROM CATEGORY WHERE NAME = ?));",
                  [result.insertId, addedCategory],
                  (addError, addResult) => {
                    if (addError) {
                      errorMsg(
                        res,
                        addError,
                        "Internal Server Error - Add CATEGORY",
                        500,
                        sid
                      );
                      reject(addError);
                    } else resolve(result.insertId);
                  }
                );
              }
            }
          }
        );
      });
    }

    const pid = await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO INVENTORY (BID, SID ,COND, QTY, CP, SP, DISCOUNT, LANG) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [bid, sid, condition, quantity, cp, sp, discount, language],
        (error, result) => {
          if (error) {
            errorMsg(
              res,
              error,
              "Internal Server Error - Add INVENTORY",
              500,
              sid
            );
            reject(error);
          } else resolve(result.insertId);
        }
      );
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    errorMsg(res, error, "Internal Server Error", 500, sid);
  }
};

/**
 * Retrieves the details of a specific order, including the order items and associated products.
 *
 * If there is an error while querying the database, it returns an error response with status 500.
 * If no order is found with the specified ID, it returns an error response with status 404.
 * If the order is found, it retrieves the order items and products associated with the order, and returns
 * a success response with status 200, along with the order, order items, and products.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Response} - the response object with the order details, order items, and products
 */
exports.orderDet = async (req, res) => {
  const sid = await getUID(req, res);
  try {
    const oid = req.query.id;
    db.query("SELECT * FROM ORDERS WHERE OID = ?", [oid], (error, order) => {
      if (error) errorMsg(res, error, "Internal Server Error", 500, sid);
      if (result.length <= 0)
        errorMsg(res, null, "No Order ID Found", 404, sid);
      else {
        db.query(
          "SELECT * FROM ORDER_ITEM WHERE OID = ?",
          [oid],
          async (error, items) => {
            if (error) errorMsg(res, error, "Internal Server Error", 500, sid);
            if (result.length <= 0)
              errorMsg(res, null, "No Order Items Found", 404, sid);
            else {
              // Fetch products for each item using another Promise.all
              const productQueries = items.map((orderItems) => {
                return Promise.all(
                  orderItems.map((item) => {
                    return new Promise((resolve, reject) => {
                      db.query(
                        "SELECT * FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;",
                        [item.PID],
                        (error, product) => {
                          if (error) {
                            errorMsg(
                              res,
                              error,
                              "Internal Server Error",
                              500,
                              id
                            );
                            reject(error);
                          } else {
                            let prod = product[0];
                            resolve(prod);
                          }
                        }
                      );
                    });
                  })
                );
              });

              const productsByOrder = await Promise.all(productQueries);

              return res.status(200).json({
                success: true,
                order: order,
                orderItems: items,
                products: productsByOrder,
              });
            }
          }
        );
      }
    });
  } catch (error) {
    errorMsg(error, "Internal Server Error", 500, sid);
  }
};

// ----------------------------------------------------------------------------
// api building for order table.
// express().get('/api/getOrders', (req, res) => {
//     db.query('SELECT O.DID,O.OID, O.UID, O.STATUS, O.TID, I.ITEMID FROM orders O JOIN ORDER_ITEM I  ON  O.OID = I.OID ', (err, results) => {
//         if (err) throw err;
//         res.json(results);
//     });
// });
const isAdmin = (req) => {
  // Assuming you have a role property in your user object, and 'admin' represents an admin user
  return req.user && req.user.role === "admin";
};

express().get("/orders", async (req, res) => {
  const sid = await getUID(req, res);
  const role = await getRole(req, res);
  // Initialize the base query
  let query =
    "SELECT O.DID, O.OID, O.UID, O.STATUS, O.TID, I.ITEMID FROM orders O JOIN ORDER_ITEM I ON O.OID = I.OID";
  // If not admin, add a WHERE clause to filter by user ID

  if (role != 4) {
    query += ` WHERE O.UID = ${sid}`;
  }

  // Use parameterized queries to prevent SQL injection
  db.query(query, (err, results) => {
    if (err) {
      // Handle errors and throw a 400 error
      return res.status(400).json({ error: "Error retrieving orders" });
    }
    res.json(results);
  });
});

// --------------------------------------------------------

// ------------------------------
  express().get("/orderDetails", async(req,res)=>{
	const sid = await getUID(req, res);
    const role = await getRole(req, res);
	let query ="SELECT O.OID, O.DATE, O.STATUS, O.TID, O.TOTAL, O.ADDRESS, O.SHIPPING, I.ITMEID, U.NAME, A.CITY, A.STATE FROM orders O INNER JOIN order_item I ON O.OID=I.OID INNER JOIN users U ON O.UID=U.UID INNER JOIN address A O.UID=A.UID";
	if (role != 4) {
		query += ` WHERE O.UID = ${sid}`;
	  }
	
	  // Use parameterized queries to prevent SQL injection
	  db.query(query, (err, results) => {
		if (err) {
		  // Handle errors and throw a 400 error
		  return res.status(400).json({ error: "Error retrieving orders" });
		}
		res.json(results);
	  });
	});
// ---------------------------------
/**
 * Retrieves the user ID (UID) from the decoded JWT token stored in the admin cookie.
 *
 * If the admin cookie is present, it decodes the JWT token using the JWT secret and retrieves the UID from it.
 * If the decoding is successful, it returns the UID.
 * If there is an error while decoding the token, it logs the error and redirects to the admin login page with a status 401.
 * If the admin cookie is not present, it redirects to the admin login page with a status 401.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {number} - the user ID (UID)
 */
const getUID = async (req, res) => {
  if (req.cookies.admin) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.admin,
        process.env.JWT_SECRET
      );
      const uid = parseInt(decode.id);
      return uid;
    } catch (error) {
      errorMsg(res, error, "Internal Server Error", 500, id);
      res.status(401).redirect("/admin/login");
    }
  } else {
    res.status(401).redirect("/admin/login");
  }
};

/**
 * Retrieves the role from the decoded JWT token stored in the admin cookie.
 *
 * If the admin cookie is present, it decodes the JWT token using the JWT secret and retrieves the role from it.
 * If the decoding is successful, it returns the role.
 * If there is an error while decoding the token, it logs the error and redirects to the admin login page with a status 401.
 * If the admin cookie is not present, it redirects to the admin login page with a status 401.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {number} - the role of the user
 */
const getRole = async (req, res) => {
  if (req.cookies.admin) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.admin,
        process.env.JWT_SECRET
      );
      const role = parseInt(decode.type);
      return role;
    } catch (error) {
      errorMsg(res, error, "Internal Server Error", 500, id);
      res.status(401).redirect("/admin/login");
    }
  } else {
    res.status(401).redirect("/admin/login");
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
  const logInfo = `UID: ${uid} \tTime: ${currDate.getDate()}/${
    currDate.getMonth() + 1
  }/${currDate.getFullYear()} ${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}\n\nError: `;
  error !== null
    ? console.error(`\n${logInfo}${error}\n`)
    : console.error(`\n${logInfo}${msg}\n`);
  return res.status(status).json({
    success: false,
    error: msg,
  });
};
