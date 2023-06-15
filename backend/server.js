const express = require("express");
const dbConnect = require("./database/index");
const { PORT } = require("./config/index");
const router = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
//config express app
const app = express();

app.use(cookieParser());
app.use(express.json());

//all routes defineed m.w.
app.use(router);

//db connceting
dbConnect();

//statically viewing images in browser
app.use("/storage", express.static("storage"));

//error handling m.w.
app.use(errorHandler);

//app listining
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
