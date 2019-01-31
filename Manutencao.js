module.exports = (app, mysqlCon, sockets, axios) => {
    app.get('/manutencao', (req, res) => {
        const con = mysqlCon();
        const params = req.query;
        let fields = 'manutencao.id id, idbike, idcar, iditemmanut, idtruck, itemmanutencao.item itemmanut, itemabrev,';
        fields += 'mes, milhas, quilometros, tipomanut';
        let query = '';
        let value = '';
        
        if (params.idcar) {
            query = `SELECT  ${fields} FROM manutencao `;
            query += 'INNER JOIN itemmanutencao ON manutencao.iditemmanut = itemmanutencao.id '
            query += 'WHERE manutencao.idcar = ? ORDER BY manutencao.id'
            value = params.idcar;
        } else if (params.idbike) {
            query = `SELECT  ${fields} FROM manutencao `;
            query += 'INNER JOIN itemmanutencao ON manutencao.iditemmanut = itemmanutencao.id '
            query += 'WHERE manutencao.idbike = ? ORDER BY manutencao.id'
            value = params.idbike;
        } else if (params.idtruck) {
            query = `SELECT  ${fields} FROM manutencao `;
            query += 'INNER JOIN itemmanutencao ON manutencao.iditemmanut = itemmanutencao.id '
            query += 'WHERE manutencao.idtruck = ? ORDER BY manutencao.id'
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

    app.post('/manutencaolote', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
        
        try {
            if (params && params.tbl && params.values && params.values.length) {
                con.connect();
                con.query('INSERT IGNORE INTO manutencao (??, mes, milhas, quilometros, tipomanut, iditemmanut) VALUES ?', 
                [params.tbl, params.values], (error, results, fields) => {
                    if (error) {
                        jsonRes.success = 'false';
                        jsonRes.message = error.sqlMessage;
                        console.log(error);
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
            } else {
                res.send(jsonRes);
            }
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
            con.query('DELETE FROM manutencao WHERE id = ?', [params.id], (error, results, fields) => {
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

