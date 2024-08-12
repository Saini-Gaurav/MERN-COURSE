const express = require('express');

const app = express();

require('dotenv/config')

const api = process.env.API_URL
app.get(api+'/', (req, res)=>{
    res.send("Hello World!");
})

app.listen(3000, ()=>{
    console.log(api)
    console.log("Server is runinng on port http://localhost:3000")
})