import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/vydora`);
        console.log(`DB connected !! \n ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("DB error: ", error);
        process.exit(1);
    }
}
export default connectDB;