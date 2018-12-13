module.exports = (app, mysqlCon, sockets, axios, _) => {
    app.get('/aros', (req, res) => {
        const con = mysqlCon();
    
        try {
            con.connect();
            con.query('SELECT * FROM aros ORDER BY id', (error, results, fields) => {
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
    });

    app.get('/arossub', (req, res) => {
        const con = mysqlCon();
        const params = req.query
    
        try {
            con.connect();
            con.query('SELECT * FROM arossub WHERE idaro = ? ORDER BY id', [params.idaro], (error, results, fields) => {
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
    });
    
    app.post('/arossub', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
    
        try {
            con.connect();
            con.query('INSERT INTO arossub SET ?', params, (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_arossub_changed', 
                            params.idaro
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

    app.post('/arossubbatch', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
    
        if (params && params.item && params.item instanceof Array && params.item.length) {
            try {
                con.connect();
                con.query('INSERT IGNORE INTO arossub (idaro, subcat) VALUES ?', [params.item], (error, results, fields) => {
                    if (error) {
                        jsonRes.success = 'false';
                        jsonRes.message = error.sqlMessage;
                    } else {
                        sockets.forEach((socket) => 
                            socket.emit(
                                'table_arossub_changed', 
                                params.item[0][0]
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

    app.delete('/arossub', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Remoção efetuada com sucesso!' };
        const params = req.query;

        try {
            con.connect();
            con.query(`DELETE FROM arossub WHERE id = ?`, [params.id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_arossub_changed', 
                            params.idaro
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

    app.post('/aros', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
    
        try {
            con.connect();
            con.query('INSERT INTO aros SET ?', req.body, (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_aros_id', 
                            results.insertId + 1
                        )
                    );
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_aros_changed', 
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

    app.post('/arosbatch', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
    
        if (params && params.item && params.item instanceof Array && params.item.length) {
            try {
                con.connect();
                con.query('INSERT IGNORE INTO aros (vehicletype, aro) VALUES ?', [params.item], (error, results, fields) => {
                    if (error) {
                        jsonRes.success = 'false';
                        jsonRes.message = error.sqlMessage;
                    } else {
                        sockets.forEach((socket) => 
                            socket.emit(
                                'table_aros_id', 
                                results.insertId + results.affectedRows
                            )
                        );
                        sockets.forEach((socket) => 
                            socket.emit(
                                'table_aros_changed', 
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
    
    app.delete('/aros', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Remoção efetuada com sucesso!' };
        const params = req.query;
        
        try {
            con.connect();
            con.query(`DELETE FROM aros WHERE id = ?`, [req.query.id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_aros_changed', 
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
    
    app.get('/arosid', (req, res) => {
        const con = mysqlCon();
    
        try {
            con.connect();
            con.query('SELECT id FROM aros ORDER BY id DESC LIMIT 1', (error, results, fields) => {
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
    });
}