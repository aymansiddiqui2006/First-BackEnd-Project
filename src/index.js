// require('dotenv').config({ path: './env' })
import dotenv from "dotenv"
import express from 'express'
import connectDB from "./DataBase/index.js";
const app = express();


dotenv.config({ path: './env' })

connectDB()
    .then(
        () => {
            app.listen(process.env.PORT || 8000, () => {
                console.log(`server is runner in port ${process.env.PORT}`);

            })
        }
    )
    .catch((err) => {
        console.log('MONGO db connection failed', err);

    })









// ; (async () => {
//     try {
//         mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error", (err) => {
//             console.log("error:", err);
//             throw err
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`app is listening on port ${process.env.PORT}`)
//         })
//     }
//     catch (err) {
//         console.error("ERROE:", err)
//         throw err
//     }
// })()