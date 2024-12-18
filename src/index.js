import connectDB from "./db/index.js";
import dotenv from "dotenv"
import app from "./app.js";

dotenv.config({
  path:'./.env'
})



connectDB()
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is listening in port ${process.env.PORT}`)
  })
})
.catch((err) => {
  console.log("Mongo DB connection failed !!!", err)
} )