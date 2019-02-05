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

    app.put('/itemmanutencao', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Modificação efetuada com sucesso!' };
        const params = req.body;
        const id = params.id;

        delete params.id;
    
        try {
            con.connect();
            con.query('UPDATE itemmanutencao SET ? WHERE id = ?', [params, id], (error, results, fields) => {
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

    app.post('/itemmanutencaobatch', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão efetuada com sucesso!' };
        const params = req.body;

        if (params && params.item && params.item instanceof Array && params.item.length) {
            try {
                con.connect();
                con.query('INSERT IGNORE INTO itemmanutencao (referencia, itemabrev, item) VALUES ?', 
                [params.item], (error, results, fields) => {
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

    app.get('/itemmanutxvehiclevtwo', (req, res) => {
        const con = mysqlCon();
        const params = req.query

        if (params.id) {
            let query = 'SELECT * FROM itemmanutencao INNER JOIN itemmanutxvehicle ON '
            query += 'itemmanutencao.id = itemmanutxvehicle.itemmanutid '
            query += 'WHERE itemmanutxvehicle.vehicleid = ? ORDER BY itemmanutencao.id';
            try {
                con.connect();
                con.query(query, [params.id], (error, results, fields) => {
                    if (!error) {
                        if (!results) return [];

                        res.send(results);
                    } else {
                        res.send([]);
                    }
                });
            } catch (e) {
                console.log(e);
                res.send([]);
            }
        } else {
            res.send([]);
        }

        con.end();
    });
    
    app.post('/itemmanutxvehicle', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Vínculo efetuado com sucesso!' };
        const params = req.body;

        if (params && 
            params.itens && 
            params.veiculos && 
            params.itens instanceof Array && 
            params.itens.length &&
            params.veiculos instanceof Array && 
            params.veiculos.length) 
        {
            try {
                const mappedItens = [];

                for (let index = 0; index < params.veiculos.length; index++) {
                    const veiculo = params.veiculos[index];

                    for (let indexB = 0; indexB < params.itens.length; indexB++) {
                        const item = params.itens[indexB];

                        mappedItens.push([item, veiculo]);
                    }
                    
                }

                con.connect();
                con.query('INSERT IGNORE INTO itemmanutxvehicle (itemmanutid, vehicleid) VALUES ?', [mappedItens], (error, results, fields) => {
                    if (error) {
                        jsonRes.success = 'false';
                        jsonRes.message = error.sqlMessage;
                        console.log(error);
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

    app.post('/itemmanutxvehiclebatch', async (req, res) => {
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
                let mappedItens = _.map(params.vehiclesTo, (item) => {
                    let vehicleid = '';
                    if (item.length === 3) {
                        vehicleid = `|${item[0].trim()}|${item[1].trim()}|${item[2].trim()}`;
                    } else if (item.length >= 4) {
                        vehicleid = `${item[0].trim()}|${item[1].trim()}|${item[2].trim()}|${item[3].trim()}`;
                    }
    
                    return [params.itemmanutID, vehicleid];
                });

                mappedItens = _.uniqBy(mappedItens, mappedItens => mappedItens[1]);

                let queryCheck = '(';
                const mappedIds = []

                mappedItens.forEach((mp, idx) => {
                    queryCheck += ('SELECT ' + con.escape(mp[1]) + (idx !== mappedItens.length - 1 ? ' notid  UNION ALL ' : ' notid '));
                    mappedIds.push(mp[1]);
                });

                queryCheck += ') TMP' ; 

                con.connect();

                let existcar = await con.query(
                    'SELECT notid FROM ' + queryCheck +' WHERE NOT EXISTS (' +
                    'SELECT id FROM (' +
                    '(SELECT id FROM car WHERE car.id IN (?)) ' +
                    'UNION ALL ' +
                    '(SELECT id FROM bike WHERE bike.id IN (?)) ' +
                    'UNION ALL ' +
                    '(SELECT id FROM truck WHERE truck.id IN (?))) VEHICLES WHERE TMP.notid = id)', 
                    [mappedIds, mappedIds, mappedIds]);

                existcar = existcar.map(newv => newv.notid);

                const filtredNotExists = _.filter(mappedItens, fmp => {
                    for (let index = 0; index < existcar.length; index++) {
                        const element = existcar[index];
                        if (fmp[1] === element) {
                            return false;
                        }
                    }

                    return true;
                })

                if (filtredNotExists && filtredNotExists.length) {
                    con.query('INSERT IGNORE INTO itemmanutxvehicle (itemmanutid, vehicleid) VALUES ?', 
                    [filtredNotExists], 
                    (error, results, fields) => {
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
                        jsonRes.success = 'true';
                        jsonRes.message = existcar;
                        res.send(jsonRes);
                    });
                } else {
                    jsonRes.success = 'true';
                    jsonRes.message = existcar;
                    res.send(jsonRes);
                }


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
            con.query(`DELETE FROM itemmanutxvehicle WHERE id IN (?)`, [params.itens], (error, results, fields) => {
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
    });
}