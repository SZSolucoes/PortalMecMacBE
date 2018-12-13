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