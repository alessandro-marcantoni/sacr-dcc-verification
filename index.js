const { Service, Certificate, Validator } = require("verificac19-sdk")
require("dotenv").config()
const express = require("express")
const awsIoT = require("aws-iot-device-sdk")

const device = awsIoT.device({
  keyPath: "sacr-raspberry.private.key",
  certPath: "sacr-raspberry.cert.pem",
  caPath: "root-CA.crt",
  clientId: "sdk-nodejs-fc46e0fc-77d1-439c-8b14-bfbfdeb8f5a9",
  host: "a1agd712iaea4u-ats.iot.us-east-1.amazonaws.com"
})

device.on('connect', function() {
  console.log('Thing connected')
})

const app = express()
const port = 3000

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(express.urlencoded({ extended: true }))

app.post("/airQuality", (req, res) => {
  device.publish("air_quality", JSON.stringify(req.body))
  res.status(200).send()
})

app.post("/temperatureHumidity", (req, res) => {
  device.publish("temperature_humidity", JSON.stringify(req.body))
  console.log(req.body)
  res.status(200).send()
})

const update = async () => {
  await Service.updateAll()
}

const rawValid = process.env.VALID
const raw = process.env.INVALID

const load = async raw => {
  return await Certificate.fromRaw(raw)
}

const validate = async dcc => {
  return await Validator.validate(dcc, Validator.mode.SUPER_DGP)
}

console.log("Downloading rules and certificates...")
update().then(() => {
  console.log("Ready!")
  load(rawValid).then(dcc => {
    console.log(dcc)
    validate(dcc).then(r => console.log(r))
  })
  setInterval(() => {
    update().then(() => {
      console.log("Updated rules and certificates.")
    })
  }, 1000 * 60 * 60 * 24)
})

app.listen(port, () => {
  console.log("Listening on port " + port)
})
