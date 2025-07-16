const { title } = require('process')
const Operacao = require('../models/OperacaoModel');
const { head, patch } = require('../routes/homeRoute')

exports.createOperacaoFormulario = (req, res, next) => {
    res.render('pages/operacoes/createOperacaoFormulario', {
        title: 'Criar Operação',
        path: '/operacoes',
        header: true,
        footer: true
    })
}

exports.createOperacao = (req, res, next) => {
    const operacao = new Operacao(req.body);
    operacao.data.id_usuario = req.session.user.id_usuario;
    operacao.validate();

    if (operacao.errors.length > 0) {
        return next(operacao.errors);
    }

    operacao.create()
        .then((result) => {
            return res.redirect('/operacoes/visualizar');
        })
        .catch(next)
}

exports.readAll = (req, res, next) => {
    const limit = 20
    const id_usuario = req.session.user.id_usuario;
    const operacao = new Operacao({});
    operacao.readAll(id_usuario, limit)
        .then((result) => {
            return res.render('pages/operacoes/visualizarOperacoes', {
                title: 'Visualizar Operações',
                path: '/operacoes',
                header: true,
                footer: true,
                operacoes: result
            })
        })
        .catch(next)
}

exports.filterAtivoFormulario = (req, res, next) => {
    res.render('pages/operacoes/readFilterAtivoFormulario', {
        title: 'Buscar por Ativo - Operações',
        path: '/operacoes',
        header: true,
        footer: true
    })   
}

exports.readAllFilterAtivo = (req, res, next) => {
    const ativo = req.body.ativo
    const operacao = new Operacao({});
    operacao.readAllFilterAtivo(ativo)
        .then((result) => {
            return res.render('pages/operacoes/visualizarOperacoes', {
                title: 'Visualizar Operações',
                path: '/operacoes',
                header: true,
                footer: true,
                operacoes: result
            })
        })
        .catch(next)
}

exports.deleteOperacaoFormulario = (req, res, next) => {
    res.render('pages/operacoes/deleteOperacaoFormulario', {
        title: 'Deletar Operações',
        path: '/operacoes',
        header: true,
        footer: true
    })
}

exports.deleteOperacao = (req, res, next) => {
    const id_usuario = req.session.user.id_usuario;
    const id_operacao = req.body.id_operacao
    const operacao = new Operacao({});
    operacao.deleteOperacao(id_usuario, id_operacao)
        .then((result) => {
            return res.redirect('/operacoes/visualizar');
        })
        .catch(next)
}