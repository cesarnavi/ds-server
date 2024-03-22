import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongoUri = process.env.MONGOOSE_URI;
let connected = false;
if(!mongoUri){
    throw new Error("MONGOOSE_URI  is required, please go to .env file and add it");
}
   

export async function connectToDatabase(){
    if(connected){
        return;
    }
  
    await mongoose.connect(mongoUri);
    connected = true;
    return;
}
export async function nextSequence(collection: string, step: number = 1){
    if(!connected){
        throw new Error("Database must be initialized")
    }
    const {count} = await mongoose.connection.db.collection("sequences").findOneAndUpdate({
        collection,
    },{
        $inc:{
            count: step
        }
    },{
        upsert: true,
        returnDocument: "after"
    });
    return count;
}