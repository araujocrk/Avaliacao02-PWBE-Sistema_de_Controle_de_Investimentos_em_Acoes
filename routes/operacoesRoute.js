const express = require('express')
const router = express.Router()

const operacaoController = require('../controllers/OperacaoController')
const estaLogado = require('../middlewares/estaLogado-middleware');


/* ----- funções de roteamento ----- */
router.get('/nova-operacao', estaLogado, operacaoController.createOperacaoFormulario);
router.post('/criar-operacao', estaLogado, operacaoController.createOperacao);

router.get('/visualizar', estaLogado, operacaoController.readAll);

router.get('/buscar-por-ativo', estaLogado, operacaoController.filterAtivoFormulario);
router.post('/buscar-por-ativo', estaLogado, operacaoController.readAllFilterAtivo);

router.get('/deletar-operacao', estaLogado, operacaoController.deleteOperacaoFormulario);
router.post('/deletar-operacao', estaLogado, operacaoController.deleteOperacao);

module.exports = router