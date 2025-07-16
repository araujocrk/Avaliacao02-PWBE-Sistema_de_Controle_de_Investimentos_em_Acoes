const User = require('../models/UserModel');

exports.cadastroFormulario = (req, res) => {
    res.render('pages/cadastro_login/cadastro', {
        title: 'Cadastro',
        footer: false,
        header: false
    });
};

exports.cadastrar = (req, res, next) => {
    const user = new User(req.body);
    user.validateUser;
    if (user.errors.length > 0) {
        return next(user.errors);
    }
    user.create()
        .then((result) => {
            return res.redirect('/user/login');
        })
        .catch(next)
};

exports.loginFormulario = (req, res) => {
    res.render('pages/cadastro_login/login', {
        title: 'Login',
        footer: false,
        header: false
    });
};

exports.logar = (req, res, next) => { 
    const user = new User(req.body);
    user.validateLogin();
    if (user.errors.length > 0) {
        return next(user.errors);
    }
    user.login()
        .then((result) => {
            req.session.user = {
                id_usuario: result.data.id_usuario,
                nome: result.data.nome,
                email: result.data.email
            }
            console.log(req.session.user)
            return res.redirect('/operacoes/nova-operacao')
        })
        .catch(next)
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);

        res.clearCookie('connect.sid'); // usa o mesmo nome do cookie
        res.redirect('/');
    });
};