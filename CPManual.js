module.exports = (app, mysqlCon, sockets, axios, _) => {
    app.post('/cpmanual', async (req, res) => {
        const con = mysqlCon();
        const jsonRes = { success: 'true', message: 'Cópia efetuada com sucesso !' };
        const params = req.body;

        const lCopyManutencao = params.cpymanut && params.cpymanut === 'true';
        const lCopyAros = params.cpyaros && params.cpyaros === 'true';

        let queryManutencao = '';
        let queryAros = '';
        let vehicleManut = [];
        let vehicleAros = [];
        
        // Monstagem de query baseada no tipo de veiculo
        if (params.vehicletype === '1') {
            queryManutencao = 'SELECT * FROM manutencao WHERE idcar = ? ORDER BY id';
            queryAros = 'SELECT * FROM comparos WHERE idcar = ? ORDER BY id';
        } else if (params.vehicletype === '2') {
            queryManutencao = 'SELECT * FROM manutencao WHERE idbike = ? ORDER BY id';
            queryAros = 'SELECT * FROM comparos WHERE idbike = ? ORDER BY id';
        } else if (params.vehicletype === '3') {
            queryManutencao = 'SELECT * FROM manutencao WHERE idtruck = ? ORDER BY id';
            queryAros = 'SELECT * FROM comparos WHERE idtruck = ? ORDER BY id';
        }

        // Query utilizada para buscar o manual do veículo a ser copiado o manual
        if (queryAros && params.vehicleOfID && (lCopyManutencao || lCopyAros)) {
            try {
                con.connect();
                if (lCopyManutencao) {
                    vehicleManut = await con.query(queryManutencao, [params.vehicleOfID]);
                }
                if (lCopyAros) {
                    vehicleAros = await con.query(queryAros, [params.vehicleOfID]);
                }
            } catch (e) {
                jsonRes.success = 'false';
                jsonRes.message = 'Falha ao buscar manual do veículo a copiar.';
                console.log(e);
                res.send(jsonRes);
                con.end();
                return false;
            }
        }

        const doCopyManut = vehicleManut && vehicleManut instanceof Array && vehicleManut.length > 0;
        const doCopyAros = vehicleAros && vehicleAros instanceof Array && vehicleAros.length > 0;
        const hasVehicleTo = params.vehiclesTo instanceof Array && params.vehiclesTo.length > 0;

        if (lCopyManutencao && !doCopyManut) {
            jsonRes.success = 'false';
            jsonRes.message = 'O veículo selecionado a copiar não possui manual de manutenção cadastrado.';
            res.send(jsonRes);
            con.end();
            return false;
        } else if (lCopyAros && !doCopyAros) {
            jsonRes.success = 'false';
            jsonRes.message = 'O veículo selecionado a copiar não possui manual de aros cadastrado.';
            res.send(jsonRes);
            con.end();
            return false;
        } else if (!hasVehicleTo) {
            jsonRes.success = 'false';
            jsonRes.message = 'Não foram informados véiculos para a cópia.';
            res.send(jsonRes);
            con.end();
        }
            
        // Copia de manual para os veiculos selecionados
        if ((doCopyManut || doCopyAros) && hasVehicleTo) {
            let newManualManut = [];
            let newManualAros = [];
            
            params.vehiclesTo.forEach(element => {
                if (lCopyManutencao) { 
                    vehicleManut.forEach(vmanut => {
                        const newVManut = { ...vmanut };
                        if (params.vehicletype === '1') {
                            newVManut.idcar = element;
                        } else if (params.vehicletype === '2') {
                            newVManut.idbike = element;
                        } else if (params.vehicletype === '3') {
                            newVManut.idtruck = element;
                        }
    
                        delete newVManut.id;
    
                        newManualManut.push(_.values(newVManut));
                    });
                }

                if (lCopyAros) {
                    vehicleAros.forEach(varos => {
                        const newVAros = { ...varos };
                        if (params.vehicletype === '1') {
                            newVAros.idcar = element;
                        } else if (params.vehicletype === '2') {
                            newVAros.idbike = element;
                        } else if (params.vehicletype === '3') {
                            newVAros.idtruck = element;
                        }
    
                        delete newVAros.id;
    
                        newManualAros.push(_.values(newVAros));
                    });
                }

            });

            if (newManualManut && newManualManut.length > 0 || newManualAros && newManualAros.length > 0) {
                try {
                    await con.beginTransaction(async (err) => {
                        if (err) { 
                            jsonRes.success = 'false';
                            jsonRes.message = 'Falha na cópia do manual.';
                            console.log(err);
                            res.send(jsonRes);
                            con.end();
                            return false;
                        }
        
                        const asyncFunExec = async () => {
                            try {
                                if (lCopyManutencao) { 
                                    await con.query(
                                        `INSERT IGNORE INTO manutencao (idcar, idbike, idtruck, mes, milhas, quilometros, tipomanut, iditemmanut) VALUES ?`, 
                                        [newManualManut]
                                    );
                                }
                                if (lCopyAros) {
                                    await con.query(
                                        `INSERT IGNORE INTO comparos (idcar, idbike, idtruck, aro, subcat) VALUES ?`,
                                        [newManualAros]
                                    );
                                }
                            } catch (e) {
                                jsonRes.success = 'false';
                                if (e && typeof e === 'object' && e.sqlMessage) {
                                    jsonRes.message = e.sqlMessage;
                                } else {
                                    jsonRes.message = 'Falha na cópia do manual.';
                                }
                                console.log(e);
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
                                        jsonRes.message = 'Falha na cópia do manual.';
                                        con.rollback(() => {
                                            res.send(jsonRes);
                                            con.end();
                                        });
                                        return false;
                                    }
                                    
                                    sockets.forEach((socket) => {
                                        if (lCopyManutencao) {
                                            socket.emit(
                                                'table_manutencao_changed', 
                                                'true'
                                            );
                                        }
                                        if (lCopyAros) {
                                            socket.emit(
                                                'table_comparos_changed', 
                                                'true'
                                            );
                                        }
                                    });
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
        
                        await asyncFunExec();
                    });
                } catch (e) {
                    jsonRes.success = 'false';
                    jsonRes.message = 'Falha de comunicação com o banco de dados';
                    console.log(e);
                    res.send(jsonRes);
                    con.end();
                }
            } else {
                jsonRes.success = 'false';
                jsonRes.message = 'Falha ao copiar manuais.';
                res.send(jsonRes);
                con.end();
                return false
            }
        }
    });
}