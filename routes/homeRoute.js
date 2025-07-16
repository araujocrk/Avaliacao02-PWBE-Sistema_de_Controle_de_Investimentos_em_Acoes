const express = require('express');
const path = require('path');
const router = express.Router();

/* ----- funções de roteamento ----- */
router.get('/', function (req, res) {
  res.render('pages/home/home',
    {
      title: 'Home',
      path: '/',
      header: true, 
      footer: true
    }
  );
});

module.exports = router