const { Service, Certificate, Validator } = require("verificac19-sdk")
require("dotenv").config()

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


