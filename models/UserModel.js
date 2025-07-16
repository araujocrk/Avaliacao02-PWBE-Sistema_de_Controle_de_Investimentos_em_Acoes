const pool = require('../databases/postgres');
const bcrypt = require("bcryptjs")
const validator = require('validator');

class User {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }
}

User.prototype.validateUser = function () {
    this.validateNome(this.data.nome);
    this.validateEmail(this.data.email);
    this.validateSenha(this.data.senha);

    if (this.errors.length === 0) {
        if (this.data.senha == this.data.senha2) {
            const validatedData = {
            nome: this.data.nome.trim(),
            email: this.data.email.trim(),
            senha: this.data.senha
        };
        this.data = validatedData
        } else {
            this.errors.push('As senhas não são iguais')
        }
    }
}

User.prototype.validateLogin = function () {
    this.validateEmail(this.data.email);
    this.validateSenha(this.data.senha);

    if (this.errors.length === 0) {
        validatedData = {
            email: this.data.email,
            senha: this.data.senha
        };
        this.data = validatedData;
    }
}

User.prototype.validateID = function (id) {
    if (!validator.isInt(String(id), { min: 1 })) {
        this.errors.push('ID deve ser um número inteiro positivo maior que zero.');
    }
}

User.prototype.validateNome = function (nome) {
    const nomeTrim = nome.trim();
    if (!nomeTrim || typeof nomeTrim !== 'string') {
        this.errors.push('Nome é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(nomeTrim, { min: 3, max: 100 })) {
            this.errors.push('Nome de usuário deve ter no mínimo 3 letras e no máximo 100.');
        }
        if (!validator.isAlpha(nomeTrim, 'pt-BR', { ignore: ' ' })) {
            this.errors.push('Nome deve conter apenas letras.');
        }
        if (nomeTrim.length > 0 && nomeTrim[0] !== nomeTrim[0].toUpperCase()) {
            this.errors.push('A primeira letra do nome deve ser maiúscula.');
        }
    }
}

User.prototype.validateEmail = function (email) {
    const emailTrim = email.trim();
    if (!emailTrim || typeof emailTrim !== 'string') {
        this.errors.push('Email é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(emailTrim, { min: 15, max: 255 })) {
            this.errors.push('Email deve ter no mínimo 15 caracteres e no máximo 255.');
        }
        if (!validator.isEmail(emailTrim)) {
            this.errors.push('Email deve conter um formato válido.');
        }
    }
}

User.prototype.validateSenha = function (senha) {
    if (!senha || typeof senha !== 'string') {
        this.errors.push('Senha é obrigatório e deve ser uma string.');
    } else {
        if (!validator.isLength(senha, { min: 8, max: 30 })) {
            this.errors.push('Senha deve ter no mínimo 8 caracteres e no máximo 30.');
        }
    }
}

User.prototype.create = function () {
    let salt = bcrypt.genSaltSync(10);
    console.log(this.data.nome)
    const senha = bcrypt.hashSync(this.data.senha, salt);
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id_usuario, nome, email';
    const values = [this.data.nome, this.data.email, senha];
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, result) => {
            if (error) {
                reject('Erro ao criar usuario: ' + error);
            } else {
                if (this.errors.length > 0) {
                    reject('Dados inválidos no banco: ' + this.errors);
                } else {
                    resolve();
                }
            }
        })
    })
}

User.prototype.login = function () {
    const sql = 'SELECT id_usuario, nome, senha FROM usuarios WHERE email = $1';
    const values = [this.data.email];
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, result) => {
            if (error) {
                return reject('Error na busca de usuario por email: ' + this.data.email);
            } 
            if (result.rows.length === 0) {
                return reject('Usuário não encontrado');
            }

            const { id_usuario, nome, senha } = result.rows[0];

            if (!bcrypt.compareSync(this.data.senha, senha)) {
                return reject('Senha incorreta');
            }

            this.validateID(id_usuario);
            this.validateNome(nome);

            if (this.errors.length > 0) {
                return reject('Dados inválidos no banco: ' + this.errors);
            } 

            const user = new User({ id_usuario, nome: nome.trim(), email: this.data.email.trim() });
            resolve(user);
        })
    })
}

module.exports = User;