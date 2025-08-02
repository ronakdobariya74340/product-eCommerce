import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/db.helper.js";
import { log1 } from "./lib/general.lib.js";
import errorHandler from "./utils/errorHandler.js";
import authRoute from "./routes/auth.router.js";
import fileUpload from "express-fileupload";
import homeRoute from "./routes/home.router.js";
import { MaintenanceMiddleware } from "./middlewares/maintainance.middleware.js";
import { syncCartToDB } from "./controllers/auth.controller.js";

const app = express();
const __dirname = path.resolve();
const assetsPath = path.join(__dirname, "assets");
const PORT = process.env.PORT || 5004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
    );
    
    app.use(
        fileUpload({
            limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
            abortOnLimit: true,
            createParentPath: true,
        })
        );
        
app.use("/assets", express.static(assetsPath));
app.use("/css", express.static(assetsPath + "/css"));
app.use("/fonts", express.static(assetsPath + "/fonts"));
app.use("/images", express.static(assetsPath + "/images"));
app.use("/js", express.static(assetsPath + "/js"));
app.use("/lib", express.static(assetsPath + "/lib"));
app.use("/vendor", express.static(assetsPath + "/vendor"));
app.use("/views", express.static("/views"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let hasSyncedCart = false;

app.use(async (req, res, next) => {
    try {
        if (!hasSyncedCart) {
            await syncCartToDB(req, true);

            res.clearCookie("celebrityCart");
            res.clearCookie("user_id");
            hasSyncedCart = true;
        };
    } catch (error) {
        log1(["All CartData Store Error ----------->", error]);
    };

    next();
});

// Routes
app.use(MaintenanceMiddleware)
app.use("/", homeRoute);
app.use('/auth', authRoute);

app.all('*', (req, res) => {
    res.status(404);
    return res.render("error/404");
});

// Route for 404 page
app.use((req, res, next) => {
    res.status(404).render("error/404");
});

// errorHandler(app);

connectDB().then(async () => {
    app.listen(PORT, async () => {
        log1(["Server is running on PORT----->", process.env.PORT]);
        log1(["Server URL-----> ", process.env.SERVER_URL]);
    });
}).catch((error) => {
    log1(["Error in connecting to database----->", error]);
    return process.exit(1);
});
