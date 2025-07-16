const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');


router.get('/cadastro', userController.cadastroFormulario);
router.post('/cadastrar', userController.cadastrar);

router.get('/login', userController.loginFormulario);
router.post('/logar', userController.logar);

router.get('/logout', userController.logout);

module.exports = router;