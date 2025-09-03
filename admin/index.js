import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import session from "express-session";
import { connectDB } from "./utils/db.helper.js";
import { log1 } from "./lib/general.lib.js";
import errorHandler from "./utils/errorHandler.js";
import route from "./routes/admin.router.js";
import fileUpload from "express-fileupload";

const app = express();
const __dirname = path.resolve();
const assetsPath = path.join(__dirname, "assets");
const PORT = process.env.PORT || 5004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/images", express.static(assetsPath + "/images"));
app.use("/fonts", express.static(assetsPath + "/webfonts"));
app.use("/css", express.static(assetsPath + "/css"));
app.use("/js", express.static(assetsPath + "/js"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use('/admin', route);

// app.all('*', (req, res) => {
//     res.status(404);
//     return res.render("error/404");
// });

// errorHandler(app);

connectDB() .then(async () => {
    app.listen(PORT, async () => {
        log1(["Server is running on PORT----->", process.env.PORT]);
        log1(["Server URL-----> ", process.env.SERVER_URL]);
    });
})
.catch((error) => {
    log1(["Error in connecting to database----->", error]);
    return process.exit(1);
});
