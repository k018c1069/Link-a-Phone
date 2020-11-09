const express = require('express')
const app = express()
const port = process.env.PORT || 3000
var admin = require("firebase-admin");

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const settings = {
  databaseURL: "https://cicd-288923.firebaseio.com"
}

if (!process.env.PORT) {
  settings.credential = admin.credential.cert(require("./admin.json"))
}

admin.initializeApp(settings)

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
})

app.post('/', (req, res) =>{
  const token = req.body.token
  try {
    admin.auth().verifyIdToken(token,true).then(auth => {
      res.json({
        auth: 'OK'
      })
    }).catch(err => {
      res.json({
        auth: 'NG'
      })
    })
  } catch(e) {
    res.json({
      error: e
    })
  }
  
})

app.listen(port, () =>{
  console.log(`Example app litening at http://localhost:${port}`)
})
