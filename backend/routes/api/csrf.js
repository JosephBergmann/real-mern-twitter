const express = require('express');
const router = express.Router();

const {isProudction} = require('../../config/keys');
/* GET users listing. */
if (!isProudction){
    router.get('/restore', function(req, res) {
        const csrfToken = req.csrfToken();
        res.status(200).json({
            'CSRF-Token': csrfToken
        });
    });
}
module.exports = router;
