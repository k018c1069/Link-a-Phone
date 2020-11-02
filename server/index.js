const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) =>{
  res.json({
    key: 'helloWorld'
  }) 
})

app.listen(port, () =>{
  console.log(`Example app litening at http://localhost:${port}`)
})
