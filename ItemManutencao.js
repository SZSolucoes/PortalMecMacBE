module.exports = (app, mysqlCon, sockets, axios, _) => {
    app.get('/itemmanutencao', (req, res) => {
        const con = mysqlCon();
        const params = req.query;

        if (params && params.id) {
            try {
                con.connect();
                con.query(
                    'SELECT * FROM itemmanutencao' +
                    ' INNER JOIN itemmanutxvehicle' + 
                    ' ON itemmanutxvehicle.itemmanutid = itemmanutencao.id' +
                    ' WHERE itemmanutxvehicle.vehicleid = ? ORDER BY itemmanutencao.id', 
                    [params.id], (error, results, fields) => {
                    if (!error) {
                        res.send(results);
                    } else {
                        console.log(error);
                        res.send([]);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        
            con.end();
        } else {
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
        }
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

    app.get('/itemmanutxvehicle', (req, res) => {
        const con = mysqlCon();
        const params = req.query
    
        try {
            con.connect();
            con.query('SELECT * FROM itemmanutxvehicle WHERE itemmanutid = ? ORDER BY id', [params.itemmanutid], (error, results, fields) => {
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
    
    app.post('/itemmanutxvehicle', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;

        if (params && 
            params.itemmanutID && 
            params.vehiclesTo && 
            params.vehiclesTo instanceof Array && 
            params.vehiclesTo.length) 
        {
            try {
                const mappedItens = _.map(params.vehiclesTo, (item) => ([ params.itemmanutID, item ]));

                con.connect();
                con.query('INSERT IGNORE INTO itemmanutxvehicle (itemmanutid, vehicleid) VALUES ?', [mappedItens], (error, results, fields) => {
                    if (error) {
                        jsonRes.success = 'false';
                        jsonRes.message = error.sqlMessage;
                        console.log(error);
                    } else {
                        sockets.forEach((socket) => 
                            socket.emit(
                                'table_itemmanutxvehicle_changed', 
                                params.itemmanutID
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
            jsonRes.message = 'Falha ao inserir dados';
            console.log(e);
            res.send(jsonRes);
        }
    });

    app.post('/itemmanutxvehiclebatch', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;
    
        if (params && 
            params.itemmanutID && 
            params.vehiclesTo && 
            params.vehiclesTo instanceof Array && 
            params.vehiclesTo.length) 
        {
            try {
                const mappedItens = _.map(params.vehiclesTo, (item) => {
                    let vehicleid = '';
                    if (item.length === 3) {
                        vehicleid = `${item[0].trim()}|${item[1].trim()}|${item[2].trim()}`;
                    } else if (item.length >= 4) {
                        vehicleid = `${item[0].trim()}|${item[1].trim()}|${item[2].trim()}|${item[3].trim()}`;
                    }
    
                    return [params.itemmanutID, vehicleid];
                });

                con.connect();
                con.query('INSERT IGNORE INTO itemmanutxvehicle (itemmanutid, vehicleid) VALUES ?', [mappedItens], (error, results, fields) => {
                    if (error) {
                        jsonRes.success = 'false';
                        jsonRes.message = error.sqlMessage;
                        console.log(error);
                    } else {
                        sockets.forEach((socket) => 
                            socket.emit(
                                'table_itemmanutxvehicle_changed', 
                                params.itemmanutID
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

    app.delete('/itemmanutxvehicle', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Remoção efetuada com sucesso!' };
        const params = req.query;

        try {
            con.connect();
            con.query(`DELETE FROM itemmanutxvehicle WHERE id = ?`, [params.id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => 
                        socket.emit(
                            'table_itemmanutxvehicle_changed', 
                            params.itemmanutID
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