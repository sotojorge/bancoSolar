const express=require('express');
const app=express();
const {insertarUsuario,obtenerUsuarios,editarUsuario,eliminar,getId,transferir,transferencias,nombres}=require('./query.js')

app.use(express.json())

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

// insertar ususarios
app.post('/usuario',async(req,res)=>{
    try{
        let data=Object.values(req.body)
        let resp=await insertarUsuario(data)
        res.json(resp)
    }catch(err){throw new Error(err)}
})

//Objetener usuarios
app.get('/usuarios',async(req,res)=>{
    try{
        let resp=await obtenerUsuarios();

        res.json(resp)


    }catch(err){
        console.log(err)
        throw new Error(err)}

})

// Editar Usuario
app.put('/usuario',async(req,res)=>{
    try{
        let {id}=req.query //query es para los queryStream o datos enviados en la URL, {id} desempaqueta el json
        let data=await req.body //body es para datos enviados en el cuerpo, express.json() y se aplica en put y post
        let values=[id,data.name,data.balance]
        let resp=await editarUsuario(values)

    }catch(err){throw new Error(err)}
})

//Eliminar usuarios
app.delete('/usuario',async(req,res)=>{
    try{
        let {id}=req.query
        let resp=await eliminar([id])
        res.send(resp)
    }catch(err){throw new Error(err)} 
})

//TRANSFERENCIA 
app.post('/transferencia',async(req,res)=>{
    try{
        let datos=await req.body;

        let emisor=await getId([datos.emisor])
        let receptor=await getId([datos.receptor])
        emisor=emisor[0].id
        receptor=receptor[0].id   

        let monto=parseFloat(datos.monto);

        let date=new Date
        let fecha=date.toISOString().split('T')[0]

        let values=[emisor,receptor,monto,fecha]
        if(emisor!=receptor){
            let resp=await transferir(values)
            res.status(200).send(resp)
        }else{throw 'No puede ser el mismo usuario'}

    }catch(err){
        res.status(500)
        console.log(err)
        throw new Error(err)} 
})

//devolver todas las transferencias
app.get('/transferencias',async(req,res)=>{
    try{
        let resp=await transferencias()
        var Idemisores=[]
        var Idreceptores=[]
        resp.forEach((ob)=>{
            Idemisores.push(ob.emisor)
            Idreceptores.push(ob.receptor)
        })

        let n=Idemisores.length
        let nombreEmisores=[]

        for(i=0;i<n;i=i+1){
            let id=Idemisores[i]
            let nombreEmisor=await nombres([id])
            nombreEmisor=nombreEmisor[0].nombre
            nombreEmisores.push(nombreEmisor)           
        }

        let nombreReceptores=[]

        for(i=0;i<n;i=i+1){
            let id=Idreceptores[i]
            let nombreReceptor=await nombres([id])
            nombreReceptor=nombreReceptor[0].nombre
            nombreReceptores.push(nombreReceptor)           
        }

       let c=0
       values=[]
        resp.forEach((item)=>{
            item.emisor=nombreEmisores[c]
            item.receptor=nombreReceptores[c]
            item=Object.values(item)
            values.push(item)
            c=c+1

        })

        console.log(values)
        res.send(values)
        
    }catch(err){throw new Error(err)}

})
app.listen(3000,console.log('SERVER ON'))

// try{}catch(err){throw new Error(err)}