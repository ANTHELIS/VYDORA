import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/dbConnection.js";
import app from "./app.js";

const PORT=process.env.PORT || 3000;


connectDB()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Server running at PORT ${PORT}`);
    })
})
.catch((error)=>{
    console.log("DB connection ERROR: ", error); 
})

