module.exports = (app, mysqlCon, sockets, axios) => {
    app.get('/itemmanutencao', (req, res) => {
        const con = mysqlCon();
    
        try {
            con.connect();
            con.query('SELECT * FROM itemmanutencao ORDER BY id', (error, results, fields) => {
                if (!error) {
                    res.send(results);
                } else {
                    res.send({ error });
                }
            });
        } catch (e) {
            console.log(e);
        }
    
        con.end();
    });
    
    app.post('/itemmanutencao', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
    
        try {
            con.connect();
            con.query('INSERT INTO itemmanutencao SET ?', req.body, (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_itemmanutencao_id', 
                            results.insertId + 1
                        )
                    );
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_itemmanutencao_changed', 
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

    app.post('/itemmanutencaobatch', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;

        if (params && params.item && params.item instanceof Array && params.item.length) {
            try {
                con.connect();
                con.query('INSERT IGNORE INTO itemmanutencao (item) VALUES ?', [params.item], (error, results, fields) => {
                    if (error) {
                        jsonRes.success = 'false';
                        jsonRes.message = error.sqlMessage;
                    } else {
                        sockets.forEach((socket) => 
                            socket.emit(
                                'table_itemmanutencao_id', 
                                results.insertId + results.affectedRows
                            )
                        );
                        sockets.forEach((socket) => 
                            socket.emit(
                                'table_itemmanutencao_changed', 
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
        } else {
            jsonRes.success = 'false';
            jsonRes.message = 'Falha na importação.';
            console.log(e);
            res.send(jsonRes);
        }
    });
    
    app.delete('/itemmanutencao', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Remoção efetuada com sucesso!' };
        const params = req.query;
        
        try {
            con.connect();
            con.query(`DELETE FROM itemmanutencao WHERE id = ?`, [req.query.id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_itemmanutencao_changed', 
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
    
    app.get('/itemmanutencaoid', (req, res) => {
        const con = mysqlCon();
    
        try {
            con.connect();
            con.query('SELECT id FROM itemmanutencao ORDER BY id DESC LIMIT 1', (error, results, fields) => {
                if (!error) {
                    res.send(results);
                } else {
                    res.send({ error });
                }
            });
        } catch (e) {
            console.log(e);
        }
    
        con.end();
    });
}