const {Pool}=require('pg')
const acces={
    user:'postgres',
    port:5432,
    password:'password',
    host:'localhost',
    database:'bancosolar'
}
const pool=new Pool(acces);

//Nuevo Usuario
const insertarUsuario=async(values)=>{
    try{
        let SQLQUERY={
            text:'INSERT INTO usuarios(nombre,balance) VALUES($1,$2) RETURNING *',
            values
        }
        let resp=await pool.query(SQLQUERY);
        return resp.rows

    }catch(err){
        console.log(err)
        throw new Error(err)}
};

//Obtener usuarios
const obtenerUsuarios=async()=>{
    try{
        let SQLQUERY={
            text:'SELECT * FROM usuarios'
        }
        let resp=await pool.query(SQLQUERY);
        return resp.rows

    }catch(err){throw new Error(err)}

};

//ediat Usuarios
const editarUsuario=async(values)=>{
    try{
        let SQLQUERY={
            text:'UPDATE usuarios SET nombre=$2,balance=$3 WHERE id=$1 RETURNING *',
            values
        }
        let resp=await pool.query(SQLQUERY);
        return resp.rows
    }catch(err){throw new Error(err)}
}

//eliminar usuario 
const eliminar=async(values)=>{
    try{
        await pool.query('BEGIN')
        //Eliminar de tabla de transferencias
        let SQLQUERY1={
            text:'DELETE FROM transferencias WHERE emisor=$1 RETURNING *',
            values
        }

        let SQLQUERY2={
            text:'DELETE FROM transferencias WHERE receptor=$1 RETURNING *',
            values
        }
        //Elimina de la tabla de usuarios
        let SQLQUERY3={
            text:'DELETE FROM usuarios WHERE id=$1 RETURNING *',
            values
        }
        
        let cons1=await pool.query(SQLQUERY1)
        let cons2=await pool.query(SQLQUERY2)

        let resp=await pool.query(SQLQUERY3);
        await pool.query('COMMIT')

        return resp.rows

    }catch(err){
        await pool.query('ROLLBACK')
        throw new Error(err)}
}

//obtener id
const getId=async(values)=>{
    try{
        let SQLQUERY={
            text:'SELECT id FROM usuarios WHERE nombre=$1',
            values,
        }
        let resp=await pool.query(SQLQUERY);
        return resp.rows
    }catch(err){throw new Error(err)}


}
//REALIZAR TRANSFERENCIA
const transferir=async(values)=>{
    //Transacciones, las cuentas deben existir pero esto no es problema por el modo en que se mandan los datos desde el front
    let [emisor,receptor,monto,fecha]=values

    //entrega dinero
    const SQL1={
        text:'UPDATE usuarios SET balance=balance-$2 WHERE id=$1',
        values:[emisor,monto]
    }
    //recibe dinero
    const SQL2={
        text:'UPDATE usuarios SET balance=balance+$2 WHERE id=$1',
        values:[receptor,monto]
    }

    //registra transaccion
    const SQL3={
        text:'INSERT INTO transferencias(emisor,receptor,monto,fecha)  VALUES($1,$2,$3,$4) RETURNING *',
        values:[emisor,receptor,monto,fecha]
    }
    try{
        await pool.query('BEGIN')
        let cons1=await pool.query(SQL1)
        let cons2=await pool.query(SQL2)
        let cons3=await pool.query(SQL3)

        await pool.query('COMMIT')
        return cons3.rows
        
        
    }catch(err){
        await pool.query('ROLLBACK')
        throw new Error(err)}
}

const transferencias=async()=>{
    let SQLQUERY={
        text:'SELECT * FROM transferencias'
    }
    try{
        let resp=await pool.query(SQLQUERY);
        return resp.rows
    }catch(err){throw new Error(err)} 
}

// obtener nombres
const nombres=async(values)=>{
    let SQLQUERY={
        text:'SELECT nombre FROM usuarios WHERE id=$1',
        values
    }
    
    try{
        let resp=await pool.query(SQLQUERY);
        return resp.rows
        
    }catch(err){throw new Error(err)} 
    
}
module.exports={insertarUsuario,obtenerUsuarios,editarUsuario,eliminar,getId,transferir,transferencias,nombres}

// try{}catch(err){throw new Error(err)}