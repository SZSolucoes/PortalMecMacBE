module.exports = (app, mysqlCon, sockets, axios) => {
    app.get('/veiculos', (req, res) => {
        const con = mysqlCon();
        const params = req.query;
        let tableType = params.vehicletype
        if (tableType === '1') {
            tableType = 'car';
        } else if (tableType === '2') {
            tableType = 'bike';
        } else {
            tableType = 'truck';
        }
    
        try {
            con.connect();
            con.query(`SELECT * FROM ${tableType}`, (error, results, fields) => { 
                res.send(results);
            });
        } catch (e) {
            jsonRes.success = 'false';
            jsonRes.message = 'Falha de comunicação com o banco de dados';
            console.log(e);
            res.send(jsonRes);
        }
    
        con.end();
    });
    
    app.post('/veiculos', (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Inclusão de veículo efetuado com sucesso!' };
        const params = req.body;
        const vehicletype = params.vehicletype;

        let tableType = params.vehicletype
        if (tableType === '1') {
            tableType = 'car';
        } else if (tableType === '2') {
            tableType = 'bike';
        } else {
            tableType = 'truck';
        }
    
        delete params.vehicletype;
    
        try {
            con.connect();
            con.query(`INSERT INTO ${tableType} SET ?`, req.body, (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => {   
                        socket.emit(
                            'table_veiculos_changed', 
                            vehicletype
                        )
                    });
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

    app.put('/veiculos', async (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Modificação efetuada com sucesso!' };
        const params = req.body;
        const id = params.id;
        const newId = params.newId;
        const vehicletype = params.vehicletype;

        params.id = newId;

        let tableType = params.vehicletype
        if (tableType === '1') {
            tableType = 'car';
        } else if (tableType === '2') {
            tableType = 'bike';
        } else {
            tableType = 'truck';
        }
        
        delete params.newId;
        delete params.vehicletype;
        
        con.connect();

        try { 
            await con.beginTransaction(async (err) => {
                if (err) { 
                    jsonRes.success = 'false';
                    jsonRes.message = 'Falha na modificação do veículo.';
                    console.log(err);
                    res.send(jsonRes);
                    con.end();
                    return false;
                }
                const asyncFunExecQuerys = async () => {
                    let rowIds = [];

                    try {
                        await con.query(`UPDATE ${tableType} SET ? WHERE id = ?`, [params, id]);
                        await con.query('UPDATE itemmanutxvehicle SET ? WHERE vehicleid = ?', [{ vehicleid: newId }, id]);
                        rowIds = await con.query('SELECT id FROM itemmanutxvehicle WHERE vehicleid = ?', [newId]);
                    } catch (er) {
                        jsonRes.success = 'false';
                        jsonRes.message = 'Falha de comunicação com o banco de dados';
                        if (er && typeof er === 'object' && er.sqlMessage) {
                            jsonRes.message = er.sqlMessage;
                        }
                        console.log(er);
                        con.rollback(() => {
                            res.send(jsonRes);
                            con.end();
                        });
                        
                        return false;
                    }

                    try {
                        con.commit((err) => {
                            if (err) {
                                jsonRes.success = 'false';
                                jsonRes.message = 'Falha na modificação do veículo.';
                                con.rollback(() => {
                                    res.send(jsonRes);
                                    con.end();
                                });
                                return false;
                            }
                            
                            rowIds.forEach(rowId => {
                                sockets.forEach((socket) => {   
                                    socket.emit(
                                        'table_itemmanutxvehicle_changed', 
                                        rowId
                                    )
                                });
                                sockets.forEach((socket) => {
                                    socket.emit(
                                        'table_veiculos_changed', 
                                        vehicletype
                                    )
                                });
                            })
                            res.send(jsonRes);
                            con.end();
                            return true;
                        });
                    } catch (e) {
                        jsonRes.success = 'false';
                        jsonRes.message = 'Falha na cópia do manual.';
                        console.log(e);
                        con.rollback(() => {
                            res.send(jsonRes);
                            con.end();
                        });
                        return false;
                    }
                };

                await asyncFunExecQuerys();
            });
        } catch (e) {
            jsonRes.success = 'false';
            jsonRes.message = 'Falha de comunicação com o banco de dados';
            if (e && typeof e === 'object' && e.sqlMessage) {
                jsonRes.message = e.sqlMessage;
            }
            console.log(e);
            res.send(jsonRes);
            con.end();
        }
    });

    app.put('/veiculoscomp', async (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Salvo com sucesso!' };
        const params = req.body;
        const id = params.id;
        const vehicletype = params.vehicletype;

        let tableType = params.vehicletype
        if (tableType === '1') {
            tableType = 'car';
        } else if (tableType === '2') {
            tableType = 'bike';
        } else {
            tableType = 'truck';
        }
    
        delete params.id;
        delete params.vehicletype;
    
        try {
            con.connect();
            con.query(`UPDATE ${tableType} SET ? WHERE id = ?`, [params, id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => {   
                        socket.emit(
                            'table_veiculos_changed', 
                            vehicletype
                        )
                    });
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
    
    app.delete('/veiculos', function (req, res) {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Remoção efetuada com sucesso!' };
        const params = req.query;
        const vehicletype = params.vehicletype;
        
        let tableType = params.vehicletype
        if (tableType === '1') {
            tableType = 'car';
        } else if (tableType === '2') {
            tableType = 'bike';
        } else {
            tableType = 'truck';
        }
    
        try {
            con.connect();
            con.query(`DELETE FROM ${tableType} WHERE id = ?`, [req.query.id], (error, results, fields) => {
                if (error) {
                    jsonRes.success = 'false';
                    jsonRes.message = error.sqlMessage;
                } else {
                    sockets.forEach((socket) => {   
                        socket.emit(
                            'table_veiculos_changed', 
                            vehicletype
                        )
                    });
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