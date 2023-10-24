const main = require('./db');
const express = require('express');
const app = express();
const port = 5000;
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("hello rani kya kar rahi ho tum")
})
// Available routes
app.use('/api/user',require('./routes/user'))
app.use('/api/notes',require('./routes/notes'))
app.listen(port,()=>{
    console.log(`server is running on ${port}`)
});
