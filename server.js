const express = require("express")

const server = express()

server.all("/", (req, res) => {
  res.send("Bot is running")
})

function onlineBot() {
  server.listen(5000, () => {
    console.log("Server is ready.")
  })
}

module.exports = onlineBot