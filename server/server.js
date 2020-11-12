const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const functions = require('firebase-functions')
const admin = require('firebase-admin')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const settings = {
  databaseURL: "https://cicd-288923.firebaseio.com"
}

if (!process.env.PORT) {
  settings.credential = admin.credential.cert(require("./admin.json"))
}

admin.initializeApp(settings)
const fireStore = admin.firestore()
const LineAuthWaiting = fireStore.collection('LineAuthWaiting')
const UserDataRef = fireStore.collection('UserData')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
})



const verifyUser = (token) => {
  return new Promise((resolve, reject) => {
    admin.auth().verifyIdToken(token,true).then(auth => {
      resolve(auth.user_id)
    }).catch(() => {
      reject()
    })
  })
}

app.post('/line', (req, res) => {
  verifyUser(req.body.token).then(userID => {
    const LineData = LineAuthWaiting.where(
      'authCode', '==', req.body.authCode
    ).get()
    LineData.then(e => {
      if (e.size > 0) {
        const data = e.docs[0].data()
        res.json({
          status: 'OK'
        })
        UserDataRef.doc(userID).set(
          {
            lineUUID: data.lineUUID
          }
        ,{merge: true})
        LineAuthWaiting.doc(e.docs[0].id).delete() 
      } else {
        res.json({
          status: 'error',
          msg: 'コードが見つかりません。'
        })
      }
    })
  }).catch(() => {
    res.send(403)
  })
})
app.post('/device', (req, res) => {
  verifyUser(req.body.token).then(userID => {
    UserDataRef.doc(userID).set({
      DeviceID: req.body.DeviceID,
      postCustomName: req.body.postCustomName
    },{merge: true})
    res.json({
      status: 'OK'
    })
  }).catch(() => {
    res.json({
      status: 'error',
      msg: 'デバイスが見つかりません。'
    })
  })
})

app.listen(port, () =>{
  console.log(`Example app litening at http://localhost:${port}`)
})
