// importing packages
const express = require('express');
const bcrypt = require('bcrypt');
const pug = require('pug');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const mysql = require('mysql');
const Razorpay = require('razorpay');
const bodyParser = require("body-parser");
const fs = require("fs");
require('dotenv').config();

//intializing express.js
const app = express();

//middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// declare static path
let staticPath = path.join(__dirname, "views");
app.use(express.static(staticPath));
express().use(bodyParser.urlencoded({
    extended: true
}));

express().use(bodyParser.json());

//set pug
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, '/views'));

//dotenv config
dotenv.config({ path: './.env' });

//db connection
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE 

})

db.connect((error) => {
    if (error) {
        console.error(error)
    }
    else {
        console.log("MySQL connected....");
    }
})

//app port
app.listen(3000, () => {
    console.log('listening on port 3000.......');
})

//routes
// app.use('/', require('./routes/routes'));
app.use('/auth', require('./routes/auth'));
app.use('/getData', require('./routes/getData'));
app.use('/setData', require('./routes/setData'));
app.use('/admin', require('./routes/admin'));

//home route
app.get(["/", "/home"], (req, res) => {
    res.sendFile(path.join(staticPath, "./index.html"));
})

//signup route
app.get("/signup", (req, res) => {
    res.sendFile(path.join(staticPath, "./signup.html"));
})

//login route
app.get("/login", (req, res) => {
    res.sendFile(path.join(staticPath, "./login.html"));
})

//profile route
app.get("/profile", (req, res) => {
    if (req.cookies.UnityLog) res.sendFile(path.join(staticPath, "./profile.html"));
    else res.status(401).redirect("/login");
})

//add Address route
app.get("/addAddress", (req, res) => {
    if (req.cookies.UnityLog) res.sendFile(path.join(staticPath, "./addAddress.html"));
    else res.status(401).redirect("/login");
})

//search route
app.get("/search", (req, res) => {
    res.sendFile(path.join(staticPath, "./search.html"));
})

app.get("/category", (req, res) => {
    res.sendFile(path.join(staticPath, "./products.html"));
})

//productPage route
app.get("/products", (req, res) => {
    const pid = req.query.id;
    try {
        db.query(
            "SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;", [pid], 
            (error, product) => {
                if (error) {
                    console.error(error);
                    const msg = "Internal Server Error";
                    return res.status(500).send({
                        error: msg
                    });
                }
                if (product.length <= 0) {
                    console.error("No Products Found");
                    const msg = "No Products Found";
                    return res.status(404).send({
                        error: msg
                    });
                }
                else {
                    // Construct the file path to the HTML file
                    const filePath = path.join(staticPath, "./productpage.html");

                    // Read the HTML file
                    fs.readFile(filePath, 'utf8', (err, html) => {
                        if (err) {
                            console.error('Error reading HTML file:', err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        let pages = (product[0].PAGES == 0 || product[0].PAGES == null) ? "-" : product[0].PAGES;
                        let weight = (product[0].WEIGHT == 0 || product[0].WEIGHT == null) ? "-" : product[0].WEIGHT;

                        // Replace placeholders in the HTML with the provided data
                        const modifiedHtml = html
                            .replace('{{product.IMG}}', product[0].IMG)
                            .replace('{{product.NAME}}', product[0].NAME)
                            .replace('{{product.AUTHOR}}', product[0].AUTHOR)
                            .replace('{{product.MRP}}', product[0].MRP)
                            .replace('{{product.DISCOUNT}}', product[0].DISCOUNT)
                            .replace('{{product.SP}}', product[0].SP)
                            .replace('{{product.QTY}}', product[0].QTY)
                            .replace('{{product.COND}}', product[0].COND)
                            .replace('{{product.LANG}}', product[0].LANG)
                            .replace('{{product.PAGES}}', pages)
                            .replace('{{product.WEIGHT}}', weight)
                            .replace('{{product.AUTHOR}}', product[0].AUTHOR)
                            .replace('{{product.FORMAT}}', product[0].FORMAT)
                            .replace('{{product.ISBN}}', product[0].ISBN)
                            .replace('{{product.DESCRIPTION}}', product[0].DESCRIPTION);


                        // Send the modified HTML as the response
                        res.status(200).send(modifiedHtml);
                    });
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
})

//company route
app.get("/company", (req, res) => {
    res.sendFile(path.join(staticPath, "./company.html"));
})

//categories route
app.get("/categories", (req, res) => {
    res.sendFile(path.join(staticPath, "./categories.html"));
})

//categories route
app.get("/manga", (req, res) => {
    res.sendFile(path.join(staticPath, "./manga.html"));
})

//contact route
app.get("/contact", (req, res) => {
    res.sendFile(path.join(staticPath, "./contactus.html"));
})

//cart route
app.get("/cart", (req, res) => {
    res.sendFile(path.join(staticPath, "./cart.html"));
})

//checkout route
app.get("/checkout", (req, res) => {
    if (req.cookies.UnityLog) {
        res.sendFile(path.join(staticPath, "./checkout.html"));
    }
    else if (req.cookies.UnityBooksCart) {
        res.sendFile(path.join(staticPath, "./guestCheckout.html"));
    }
    else {
        res.status(401).redirect("/cart");
    }
})

//success route
app.get("/success", (req, res) => {
    res.sendFile(path.join(staticPath, "./payment_success.html"));
})

//failure route
// app.get("/failure", (req, res) => {
//     res.sendFile(path.join(staticPath, "./payment_failure.html"));
// })

//maintenance route
app.get("/maintenance", (req, res) => {
    res.sendFile(path.join(staticPath, "./maintenance.html"));
})

//myorders route
app.get("/myorders", (req, res) => {
    res.sendFile(path.join(staticPath, "./myorders.html"));
})

app.post("/api/addToCart", async (req, res) => {
    let pid = req.body.pid;
    let qty = req.body.qty;
    if (req.cookies.UnityLog) {
        let uid = await getUID(req, res);
        db.query("SELECT * FROM CART_ITEM WHERE CARTID = ? AND PID = ?", [uid, pid], (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    success: false,
                    error: error
                });
            }
            if (result.length > 0) {
                try {
                    db.query("CALL update_cart_item(?, ?, ?, ?, ?);", [uid, result[0].ITEMID, pid, qty, result[0].QTY], (error, result) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({
                                success: false,
                                error: error
                            });
                        }
                        else if (result) {
                            return res.status(200).json({
                                success: true,
                            });
                        }
                    })
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        error: error
                    });
                }
            }
            else {
                try {
                    db.query("CALL add_cart_item(?, ?, ?);", [uid, pid, qty], (error, result) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({
                                success: false,
                                error: error
                            });
                        }
                        else if (result) {
                            return res.status(200).json({
                                success: true,
                            });
                        }
                    })
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        error: error
                    });
                }
            }
        })
    }
    // Guest User
    else {
        if (req.cookies.UnityBooksCart) {
            let items = JSON.parse(req.cookies.UnityBooksCart);
            let newItem = { pid: pid, qty: qty };

            // Check if the item with the same ID exists in the existing cart
            let existingItemIndex = -1;
            for (let i = 0; i < items.CART.length; i++) {
                if (items.CART[i].pid === pid) {
                    existingItemIndex = i;
                    break;
                }
            }

            if (existingItemIndex !== -1) {
                // If the item exists, update its quantity
                items.CART[existingItemIndex].qty = qty;
            } else {
                // If the item doesn't exist, add the new item
                items.CART.push(newItem);
            }

            // Remove items with zero or negative quantity
            items.CART = items.CART.filter(item => item.qty > 0);

            const cookieToken = JSON.stringify({ CART: items.CART });
            return res.cookie("UnityBooksCart", cookieToken, {
                expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            }).status(200).json({ success: true, });
        }
        else {
            let items = [{ pid: pid, qty: qty },];
            const cookieToken = JSON.stringify({ CART: items });

            return res.cookie("UnityBooksCart", cookieToken, {
                expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            }).status(200).json({ success: true, });
        }
    }
})

app.post("/api/addCoupon", async (req, res) => {
    const coupon = req.body.coupon;
    try {
        db.query("SELECT * FROM COUPON WHERE COUPONID = ?", [coupon], async (error, coupons) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    success: false,
                    error: error
                });
            }
            if (coupons.length > 0) {
                const uid = await getUID(req, res);
                const couponCode = coupons[0].COUPONID;
                if (coupons[0].FREQ === 1) {
                    const userOrders = await db.query("SELECT * FROM ORDERS WHERE UID = ? AND COUPON = ?", [uid, couponCode]);
                    if (userOrders.length > 0) {
                        return res.status(200).json({
                            success: false,
                            error: "Coupon Already Applied"
                        });
                    }
                }
                db.query("SELECT * FROM CART WHERE CARTID = ?", [uid], async (error, cart) => {
                    const discount = coupons[0].DISCOUNT;
                    const upto = coupons[0].UPTO;
                    const delivery = coupons[0].DELIVERY
                    const subtotal = cart[0].SUBTOTAL;
                    const subtotal1 = (discount === null) ? 0 : (subtotal * discount) / 100;
                    const subtotal2 = (upto === null) ? 0 : upto;

                    let newSubtotal = 0;
                    if (discount === null) newSubtotal = upto;
                    else if (upto == null) newSubtotal = (subtotal * discount) / 100;
                    else newSubtotal = Math.min(subtotal1, subtotal2);

                    const update = await db.query("UPDATE CART SET COUPON = ?, COUPONAMT = ? WHERE CARTID = ?;", [couponCode, newSubtotal, uid]);
                    db.query("SELECT * FROM CART WHERE CARTID = ?", [uid], (error, newCart) => {
                        return res.status(200).json({
                            success: true,
                            cart: newCart,
                            delivery: delivery
                        })
                    });
                });
            }
            else {
                return res.status(200).json({
                    success: false,
                    error: "Invalid Coupon"
                })
            }

        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error
        });
    }
})


 
// --------------------------------
// Route to check if a user is a seller or an admin
app.get('/registerSeller', async(req, res) => {
    const SID =await getUID(req, res);
    db.query('SELECT * FROM SELLER WHERE SID = ?', [SID], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).send('Internal Server Error');
      } else {
        if (results.length > 0) {
          // User is a seller
          res.redirect('/seller.html');
        } else {
          // User is not a seller, redirect to admin page
          res.redirect('/admin');
        }
      }
    });
  });
//   ------------------------------
// Endpoint to register a user as a seller
app.post('/api/registerSeller', async(req, res) => {
    const UID =await getUID(req, res);
    // Check if the user already exists in the database (you might want to enhance this check)
    db.query('SELECT * FROM USERS WHERE UID = ?', [UID], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          // User exists, proceed to register as a seller
          db.query('INSERT INTO SELLER (SID) VALUES (?)', [UID], (err) => {
            if (err) {
              console.error('Error executing MySQL query:', err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              res.json({ message: 'Seller registered successfully' });
            } 
          });
        } else {
          // User does not exist
          res.status(404).json({ error: 'User not found. Cannot register as a seller.' });
        }
      }
    });
  });
// ---------------------------------


app.get("/api/getCart", async (req, res) => {
    if (req.cookies.UnityLog) {
        let uid = await getUID(req, res);
        try {
            db.query("SELECT * FROM CART WHERE CARTID = ?", [uid], (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        error: error
                    });
                }
                if (result[0].ITEMS > 0) {
                    db.query("SELECT * FROM CART_ITEM WHERE CARTID = ?", [uid], async (error, items) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({
                                success: false,
                                error: error
                            });
                        }
                        else {
                            try {
                                // Use Promise.all to wait for all the queries to complete
                                const queries = items.map(item => {
                                    return new Promise((resolve, reject) => {
                                        db.query("SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;", [item.PID], (error, product) => {
                                            if (error) {
                                                console.error(error);
                                                reject(error);
                                            } else {
                                                let prod = product[0];
                                                resolve(prod);
                                            }
                                        });
                                    });
                                });

                                // Wait for all queries to complete
                                let products = await Promise.all(queries);

                                return res.status(200).json({
                                    success: true,
                                    cart: result,
                                    cartItems: items,
                                    products: products
                                });
                            } catch (error) {
                                console.error(error);
                                return res.status(500).json({
                                    success: false,
                                    error: error
                                });
                            }
                        }
                    })
                }
                else if (result[0].ITEMS == 0 && result.length > 0) {
                    return res.status(200).json({
                        success: true,
                        cart: result,
                        cartItems: null,
                        products: null
                    });
                }
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: error
            });
        }
    }
    else if (req.cookies.UnityBooksCart) {
        let itemsObject = JSON.parse(req.cookies.UnityBooksCart);

        // Extract the cart object directly
        let items = itemsObject.CART;
        items = items.filter((item) => item.qty > 0);
        try {
            // Use Promise.all to wait for all the queries to complete
            const queries = items.map(item => {
                return new Promise((resolve, reject) => {
                    db.query("SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;", [item.pid], (error, product) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                        } else {
                            let prod = product[0];
                            resolve(prod);
                        }
                    });
                });
            });

            // Wait for all queries to complete
            let products = await Promise.all(queries);

            let total = 0, subtotal = 0, cartItems = [];
            for (let i = 0; i < products.length; i++) {
                total += products[i].MRP;
                subtotal += products[i].SP;
                cartItems.push({ ITEMID: i, PID: items[i].pid, QTY: items[i].qty });
            }

            // Create the cart object with TOTAL and SUBTOTAL
            let cart = [{ ITEMS: items.length, TOTAL: total, SUBTOTAL: subtotal },];

            return res.status(200).json({
                success: true,
                cart: cart,
                cartItems: cartItems,
                products: products
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: error
            });
        }
    }
    else {
        return res.status(200).json({
            success: true,
            cart: null,
            cartItems: null,
            products: null
        });
    }
})

app.post("/api/updateCart", async (req, res) => {
    let pid = req.body.pid;
    let qty = req.body.qty;
    let newQty = req.body.newQty;
    let itemId = req.body.itemId;
    if (req.cookies.UnityLog) {
        let uid = await getUID(req, res);
        try {
            db.query("CALL update_cart_item(?, ?, ?, ?, ?);", [uid, itemId, pid, newQty, qty], (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        error: error
                    });
                }
                else if (result) {
                    if (newQty === 0) {
                        db.query("UPDATE CART SET COUPON = ?, COUPONAMT = ? WHERE CARTID = ?;", [null, 0, uid]);
                    }
                    return res.status(200).json({
                        success: true,
                    });
                }
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: error
            });
        }
    }
    else {
        let items = JSON.parse(req.cookies.UnityBooksCart);

        let newItem = { pid: pid, qty: newQty };

        // Check if the item with the same ID exists in the existing cart
        let existingItemIndex = -1;
        for (let i = 0; i < items.CART.length; i++) {
            if (items.CART[i].pid === pid) {
                existingItemIndex = i;
                break;
            }
        }

        if (existingItemIndex !== -1) {
            // If the item exists, update its quantity
            items.CART[existingItemIndex].qty = newQty;
        } else {
            // If the item doesn't exist, add the new item
            items.CART.push(newItem);
        }

        // Remove items with zero or negative quantity
        items.CART = items.CART.filter(item => item.qty > 0);

        const cookieToken = JSON.stringify({ CART: items.CART });

        return res.cookie("UnityBooksCart", cookieToken, {
            expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        }).status(200).json({ success: true, });
    }
})

app.get("/api/getDetails", async (req, res) => {
    if (req.cookies.UnityLog) {
        let uid = await getUID(req, res);
        try {
            db.query("SELECT * FROM USERS U JOIN ADDRESS A ON U.UID = A.UID WHERE U.UID = ? AND A.DADD = 1;", [uid], (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(401).json({
                        success: false,
                        error: error
                    });
                }
                else if (result) {
                    return res.status(200).json({
                        success: true,
                        name: result[0].NAME,
                        phone: result[0].PHONE,
                        email: result[0].EMAIL,
                        password: result[0].PASSWORD,
                        wallet: result[0].WALLET,
                        rcode: result[0].RCODE,
                        referrer: result[0].REFERRER,
                        sellerType: result[0].SELLER_TYPE,
                        photo: result[0].PHOTO,
                        login: result[0].LOGIN,
                        created: result[0].CREATED,
                        aid: result[0].AID,
                        address1: result[0].ADD1,
                        address2: result[0].ADD2,
                        city: result[0].CITY,
                        state: result[0].STATE,
                        pin: result[0].PIN,
                    });
                }
            })
        }
        catch (error) {
            console.error(error);
            return res.status(400).json({
                success: false,
                error: error
            });
        }
    }
    else {
        res.status(401).redirect("/login");
    }
})

//RazorPay
app.post('/orders', async (req, res) => {
    let { amount } = req.body;

    var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

    let order = await instance.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: "receipt#1",
    });

    res.status(201).json({
        success: true,
        order,
        amount,
    })
})

app.get('/razorpay/pay', async (req, res) => {
    try {
        const uid = await getUID(req, res);
        db.query('SELECT NAME, PHONE, EMAIL FROM USERS WHERE UID = ?', [uid], async (error, result) => {
            try {
                const name = result[0].NAME;
                const phone = result[0].PHONE;
                const email = result[0].EMAIL;
                res.json({ name, phone, email });

            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.post('/api/orders', async (req, res) => {
    let amount = req.body.amt;
    let paymentId = req.body.paymentId;
    let deliveryCharge = req.body.deliveryCharge;
    let uid = await getUID(req, res);
    try {
        db.query("SELECT AID FROM ADDRESS WHERE UID = ? AND DADD = 1", [uid], async (error, result) => {
            let aid = result[0].AID;
            db.query("CALL create_full_order(?, ?, ?, ?, ?);", [uid, paymentId, aid, amount, deliveryCharge], (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        error: error
                    });
                }
                else if (result) {
                    db.query("SELECT COUPON, COUPONAMT FROM CART WHERE CARTID = ?", [uid], (error, coupon) => {
                        if (error) {
                            console.error(error);
                            return res.status(200).json({
                                success: true,
                            });
                        }
                        else if (coupon[0].COUPON) {
                            db.query("UPDATE CART SET COUPON = ?, COUPONAMT = ? WHERE CARTID = ?;", [coupon[0].COUPON, coupon[0].COUPONAMT, uid]);
                        }
                    });
                    return res.status(200).json({
                        success: true,
                    });
                }
            })
        })

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            error: error
        });
    }
})

app.get('/api/myorders', async (req, res) => {
    if (req.cookies.UnityLog) {
        let uid = await getUID(req, res);
        try {
            db.query("SELECT * FROM ORDERS WHERE UID = ? ORDER BY OID DESC", [uid], async (error, orders) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        error: error
                    });
                }

                if (orders.length > 0) {

                    // Use Promise.all to wait for all the queries to complete
                    const orderItemQueries = orders.map(order => {
                        return new Promise((resolve, reject) => {
                            db.query("SELECT * FROM ORDER_ITEM WHERE OID = ?", [order.OID], (error, items) => {
                                if (error) {
                                    console.error(error);
                                    reject(error);
                                } else {
                                    resolve(items);
                                }
                            });
                        });
                    });

                    const items = await Promise.all(orderItemQueries);

                    // Fetch products for each item using another Promise.all
                    const productQueries = items.map(orderItems => {
                        return Promise.all(orderItems.map(item => {
                            return new Promise((resolve, reject) => {
                                db.query("SELECT I.PID, I.BID, I.SID, I.COND, I.QTY, I.CP, I.SP, I.DISCOUNT, I.LANG, B.ISBN, B.NAME, B.MRP, B.DESCRIPTION, B.IMG, B.AUTHOR, B.FORMAT, B.PAGES, B.WEIGHT, B.REVIEW FROM INVENTORY I JOIN BOOKS B ON I.BID = B.BID WHERE I.PID = ?;", [item.PID], (error, product) => {
                                    if (error) {
                                        console.error(error);
                                        reject(error);
                                    } else {
                                        let prod = product[0];
                                        resolve(prod);
                                    }
                                });
                            });
                        }));
                    });

                    const productsByOrder = await Promise.all(productQueries);

                    return res.status(200).json({
                        success: true,
                        orders: orders,
                        orderItems: items,
                        products: productsByOrder
                    });
                } else {
                    return res.status(200).json({
                        success: true,
                        orders: null,
                        orderItems: null,
                        products: null
                    });
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: error
            });
        }
    } else {
        res.status(401).redirect("/login");
    }
});

//uid function
async function getUID(req, res) {
    if (req.cookies.UnityLog) {
        console.log(req.cookies.UnityLog);
        try {
            const decode = await promisify(jwt.verify)(
                req.cookies.UnityLog,
                process.env.JWT_SECRET
            );
            const uid = decode.id;
            return uid;
        } catch (error) {
            console.error(error);
            res.status(200).sendFile(path.join(staticPath, "./login.html"));
        }
    } else {
        res.status(200).sendFile(path.join(staticPath, "./login.html"));
    }
};

//404 route
app.get("/404", (req, res) => {
    res.status(404).sendFile(path.join(staticPath, "./404page.html"));
})

app.use((req, res) => {
    res.redirect('/404');
})
