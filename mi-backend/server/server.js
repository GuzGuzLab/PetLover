// Librarys 
const express = require('express')

// Imports 
const citas = require('../api/citas'
    
)

// function to Define routers
function routerApi(app) {
    // Router
    const router = express.Router()

    // Main router
    app.use('/',router)

    // Routes
    router.use('/citas',citas)
    router.use('/usuarios',citas)
}

// Export Router
module.exports = { routerApi }