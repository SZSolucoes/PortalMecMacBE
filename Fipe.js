module.exports = (app, mysqlCon, sockets, axios) => {
    app.get('/ConsultarTabelaDeReferencia', (req, res) => {
        return axios.post(
            'http://veiculos.fipe.org.br/api/veiculos/ConsultarTabelaDeReferencia', 
            {},
            {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                    Referer: 'http://veiculos.fipe.org.br',
                    Host: 'veiculos.fipe.org.br',
                    Origin: 'veiculos.fipe.org.br'
                }
            }
        )
        .then((axres) => res.send({ success: 'true', data: axres.data }))
        .catch(() => res.send({ success: 'false', data: [] }));
    });
    
    app.get('/ConsultarMarcas', (req, res) => {
        return axios.post(
            'http://veiculos.fipe.org.br/api/veiculos/ConsultarMarcas', 
            {
                ...req.query
            },
            {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                    Referer: 'http://veiculos.fipe.org.br',
                    Host: 'veiculos.fipe.org.br',
                    Origin: 'veiculos.fipe.org.br'
                }
            }
        )
        .then((axres) => res.send({ success: 'true', data: axres.data }))
        .catch(() => res.send({ success: 'false', data: [] }));
    });
    
    app.get('/ConsultarModelos', (req, res) => {
        return axios.post(
            'http://veiculos.fipe.org.br/api/veiculos/ConsultarModelos', 
            {
                ...req.query
            },
            {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                    Referer: 'http://veiculos.fipe.org.br',
                    Host: 'veiculos.fipe.org.br',
                    Origin: 'veiculos.fipe.org.br'
                }
            }
        )
        .then((axres) => res.send({ success: 'true', data: axres.data }))
        .catch(() => res.send({ success: 'false', data: [] }));
    });
    
    app.get('/ConsultarAnoModelo', (req, res) => {
        return axios.post(
            'http://veiculos.fipe.org.br/api/veiculos/ConsultarAnoModelo', 
            {
                ...req.query
            },
            {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                    Referer: 'http://veiculos.fipe.org.br',
                    Host: 'veiculos.fipe.org.br',
                    Origin: 'veiculos.fipe.org.br'
                }
            }
        )
        .then((axres) => res.send({ success: 'true', data: axres.data }))
        .catch(() => res.send({ success: 'false', data: [] }));
    });
    
    app.get('/ConsultarModelosAtravesDoAno', (req, res) => {
        return axios.post(
            'http://veiculos.fipe.org.br/api/veiculos/ConsultarModelosAtravesDoAno', 
            {
                ...req.query
            },
            {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                    Referer: 'http://veiculos.fipe.org.br',
                    Host: 'veiculos.fipe.org.br',
                    Origin: 'veiculos.fipe.org.br'
                }
            }
        )
        .then((axres) => res.send({ success: 'true', data: axres.data }))
        .catch(() => res.send({ success: 'false', data: [] }));
    });
    
    app.get('/ConsultarValorComTodosParametros', (req, res) => {
        return axios.post(
            'http://veiculos.fipe.org.br/api/veiculos/ConsultarValorComTodosParametros', 
            {
                ...req.query
            },
            {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                    Referer: 'http://veiculos.fipe.org.br',
                    Host: 'veiculos.fipe.org.br',
                    Origin: 'veiculos.fipe.org.br'
                }
            }
        )
        .then((axres) => res.send({ success: 'true', data: axres.data }))
        .catch(() => res.send({ success: 'false', data: [] }));
    });
}