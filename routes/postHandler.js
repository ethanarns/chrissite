var express = require('express');
var router = express.Router();

router.post('/submitQuestion', function(req, res) {
    var name_unsafe = req.body.name;
    var preferered_unsafe = req.body.preferredContact;
    var telephone_unsafe = req.body.telephone;
    var email_unsafe = req.body.email;
    var location_unsafe = req.body.location;
    var question_unsafe = req.body.question;
    console.log(req.body);
    res.redirect('/');
});

module.exports = router;