const validator = require('validator');
const ATIVOS_VALIDOS = ['PETR4', 'ITSA4', 'BBAS3', 'WEGE3', 'BBSE3'];
const TIPOS_VALIDOS = ['compra', 'venda'];

const pool = require('../databases/postgres');

class Operacao {
	constructor(data) {
		this.data = data;
		this.errors = [];
	}
}

Operacao.prototype.validate = function () {
	let data = this.data.data;
	let ativo = this.data.ativo;
	let tipo_operacao = this.data.tipo_operacao;
	let quantidade = this.data.quantidade;
	let preco = this.data.preco;
	let id_usuario = this.data.id_usuario;
	let id_operacao = this.data.id_operacao;

	if (id_operacao) {
		if (!validator.isInt(String(id_operacao))) {
			this.errors.push('Id inválido')
		}
	}

	if (id_usuario) {
		if (!validator.isInt(String(id_usuario))) {
			this.errors.push('Id inválido')
		}
	}

	if (!validator.isDate(data)) {
		this.errors.push('Formato de data inválido.')
	}
	if (!validator.isIn(ativo, ATIVOS_VALIDOS)) {
		this.errors.push('Código do ativo inválido.')
	}
	if (!validator.isIn(tipo_operacao, TIPOS_VALIDOS)) {
		this.errors.push('Tipo de operação inválido.')
	}
	if (!validator.isInt(String(quantidade))) {
		this.errors.push('Quantidade deve ser um número inteiro.')
	} else {
		quantidade = parseInt(quantidade)
		if (quantidade <= 0) {
			this.errors.push('Quantidade deve ser maior que zero.')
		}
	}
	if (!validator.isFloat(String(preco))) {
		this.errors.push('Preço deve ser um número real.')
	} else {
		preco = parseFloat(preco)
		if (preco <= 0) {
			this.errors.push('Preço deve ser maior que zero.')
		}
	}

	if (this.errors.length === 0) {
		const valor_bruto = this.data.preco * this.data.quantidade;
		const taxa_b3 = valor_bruto * 0.0003; // 0.03% de taxa B3
		const valor_liquido = this.data.tipo_operacao === 'compra' ? (valor_bruto + taxa_b3) : (valor_bruto - taxa_b3);
		validatedData = {
			data: data,
			ativo: ativo,
			tipo_operacao: tipo_operacao,
			quantidade: quantidade,
			preco: preco,
			valor_bruto: valor_bruto,
			taxa_b3: taxa_b3,
			valor_liquido: valor_liquido,
			id_usuario: id_usuario,
			id_operacao: id_operacao
		}
		this.data = validatedData;
	}
}

function parseTupleToOperacao(tupla) {
	const operacao = new Operacao({
		id_operacao: tupla.id_operacao,
		data: tupla.data,
		ativo: tupla.ativo,
		tipo_operacao: tupla.tipo_operacao,
		quantidade: tupla.quantidade,
		preco: tupla.preco,
		valor_bruto: tupla.valor_bruto,
		taxa_b3: tupla.taxa_b3,
		valor_liquido: tupla.valor_liquido,
	});
	return operacao;
}

function formatarData(dataString) {
	const data = new Date(dataString);

	const dia = String(data.getDate()).padStart(2, '0');
	const mes = String(data.getMonth() + 1).padStart(2, '0'); // meses começam em 0
	const ano = data.getFullYear();

	const dataFormatada = `${dia}/${mes}/${ano}`;
	return dataFormatada
}

Operacao.prototype.create = function () {
	const query_text = 'INSERT INTO operacoes (id_usuario_fk, data, ativo, tipo_operacao, quantidade, preco, valor_bruto, taxa_b3, valor_liquido) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_operacao;'
	const query_params = [this.data.id_usuario, this.data.data, this.data.ativo, this.data.tipo_operacao, this.data.quantidade, this.data.preco, this.data.valor_bruto, this.data.taxa_b3, this.data.valor_liquido]
	return new Promise((resolve, reject) => {
		pool.query(query_text, query_params, (error, result) => {
			if (error) {
				reject('Erro ao inserir operação: ' + error);
			} else {
				const idDaOperacaoSalva = result.rows[0].id_operacao;
				resolve(idDaOperacaoSalva);
			}
		});
	});
}

Operacao.prototype.readAll = function (id_usuario, limit) {
	const query_text = 'SELECT id_operacao, data, ativo, tipo_operacao, quantidade, preco, valor_bruto, taxa_b3, valor_liquido FROM operacoes WHERE id_usuario_fk = $1 ORDER BY data DESC LIMIT $2';
	const query_params = [id_usuario, limit];
	return new Promise((resolve, reject) => {
		pool.query(query_text, query_params, (error, result) => {
			if (error) {
				reject('Erro na busca das operações' + error);
			}
			const listaOperacoes = [];
			const errors = [];
			if (result.rows.length === 0) {
				reject('Nenhuma operação encontrada');
			}
			for (let o = 0; o < result.rows.length; o++) {
				const tupla = result.rows[o];
				const operacao = parseTupleToOperacao(tupla);
				operacao.validate();
				if (operacao.errors.length > 0) {
					errors.push(...operacao.errors);
				} else {
					operacao.data.data = formatarData(operacao.data.data);
					listaOperacoes.push(operacao);
				}
			}
			if (errors.length > 0) {
				reject(errors);
			}
			resolve(listaOperacoes);
		})
	})
}

Operacao.prototype.readAllFilterAtivo = function (ativo) {
	const query_text = 'SELECT id_operacao, data, ativo, tipo_operacao, quantidade, preco, valor_bruto, taxa_b3, valor_liquido FROM operacoes WHERE ativo = $1 ORDER BY data DESC';
	const query_params = [ativo];
	return new Promise((resolve, reject) => {
		pool.query(query_text, query_params, (error, result) => {
			if (error) {
				reject('Erro na busca das operações' + error);
			}
			const listaOperacoes = [];
			const errors = [];
			if (result.rows.length === 0) {
				reject('Nenhuma operação encontrada');
			}
			for (let o = 0; o < result.rows.length; o++) {
				const tupla = result.rows[o];
				const operacao = parseTupleToOperacao(tupla);
				operacao.validate();
				if (operacao.errors.length > 0) {
					errors.push(...operacao.errors);
				} else {
					operacao.data.data = formatarData(operacao.data.data);
					listaOperacoes.push(operacao);
				}
			}
			if (errors.length > 0) {
				reject(errors);
			}
			resolve(listaOperacoes);
		})
	})
}

Operacao.prototype.deleteOperacao = function (id_usuario, id_operacao) {
	const query_text = 'DELETE FROM operacoes WHERE id_usuario_fk = $1 AND id_operacao = $2;'
	const query_params = [id_usuario, id_operacao]
	return new Promise((resolve, reject) => {
		pool.query(query_text, query_params, (error, result) => {
			if (error) {
				reject('Erro ao deletar a operacao: ' + error);
			} else {
				resolve();
			}
		});
	});
}

// Operacao.prototype.delete = function (id_operacoes) {
// 	this.data.id = id_operacoes


// 	if (!validator.isInt(String(String(this.data.id)))) {
// 		this.errors.push('Id inválido para deletar');
// 		return Promise.reject(this.errors);
// 	}

// 	const query_text = 'DELETE FROM operacoes WHERE id_usuario = $1;'
// 	const query_params = [this.data.id]
// 	return new Promise((resolve, reject) => {
// 		pool.query(query_text, query_params, (error, result) => {
// 			if (error) {
// 				reject('Erro ao deletar a operacao: ' + error);
// 			} else {
// 				resolve('Operacao deletada com sucesso');
// 			}
// 		});
// 	});
// }



module.exports = Operacao;