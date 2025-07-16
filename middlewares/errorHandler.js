// module.exports = (err, req, res, next) => {
//     console.error('🔥 Erro capturado:', err);

//      const status = res.statusCode !== 200 ? res.statusCode : 500;

//     // Define a mensagem de erro para exibir na página
//     const mensagem = Array.isArray(err)
//         ? err.join('<br>')
//         : (err.message || 'Erro inesperado.');

//     res.status(status).render('pages/erro/erro', {
//         title: 'Erro',
//         mensagem,
//         statusCode: status,
//         mostrarHeader: false,
//         mostrarFooter: false
//     });
// };