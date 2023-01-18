import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from 'dotenv'
import docRoute from './routes/doc.mjs'

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())
dotenv.config()

const dbUri = process.env.DB_URI
mongoose.connect(dbUri)

app.get('/', async (req, res) => {
    res.status(200).send({
        messege: 'This is the server for sysborg clone',
    })
})

app.use('/api/v1/docs', docRoute)

////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////

app.listen(port, () => console.log(`Server is listening on port ${port}!`))