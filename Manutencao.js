module.exports = (app, mysqlCon, sockets, axios) => {
    app.get('/manutencao', (req, res) => {
        const con = mysqlCon();
        const params = req.query;
        let query = '';
        let value = '';
        
        if (params.idcar) {
            query = 'SELECT * FROM manutencao WHERE idcar = ? ORDER BY id';
            value = params.idcar;
        } else if (params.idbike) {
            query = 'SELECT * FROM manutencao WHERE idbike = ? ORDER BY id';
            value = params.idbike;
        } else if (params.idtruck) {
            query = 'SELECT * FROM manutencao WHERE idtruck = ? ORDER BY id';
            value = params.idtruck;
        }

        if (query && value) {
            try {
                con.connect();
                con.query(query, [value], (error, results, fields) => {
                    if (!error) {
                        res.send(results);
                    } else {
                        res.send([]);
                    }
                });
            } catch (e) {
                console.log(e);
            }

            con.end();
        }
    });
    
    app.post('/manutencao', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
    
        try {
            con.connect();
            con.query('INSERT INTO manutencao SET ?', req.body, (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_manutencao_changed', 
                            'true'
                        )
                    );
                }
                res.send(jsonRes);
            });
        } catch (e) {
            jsonRes.success = 'false';
            jsonRes.message = 'Falha de comunicação com o banco de dados';
            console.log(e);
            res.send(jsonRes);
        }
    
        con.end();
    });
    
    app.delete('/manutencao', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Remoção efetuada com sucesso!' };
        const params = req.query;
        
        try {
            con.connect();
            con.query('DELETE FROM manutencao WHERE id = ?', [req.query.id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_manutencao_changed', 
                            'true'
                        )
                    );
                }
                res.send(jsonRes);
            });
        } catch (e) {
            jsonRes.success = 'false';
            jsonRes.message = 'Falha de comunicação com o banco de dados';
            console.log(e);
            res.send(jsonRes);
        }
    
        con.end();
    });

    app.put('/manutencao', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Modificação efetuada com sucesso!' };
        const params = req.body;
        const id = params.id;

        delete params.id;

        try {
            con.connect();
            con.query(`UPDATE manutencao SET ? WHERE id = ?`, [params, id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_manutencao_changed', 
                            'true'
                        )
                    );
                }
                res.send(jsonRes);
            });
        } catch (e) {
            jsonRes.success = 'false';
            jsonRes.message = 'Falha de comunicação com o banco de dados';
            console.log(e);
            res.send(jsonRes);
        }
    
        con.end();
    });
}

