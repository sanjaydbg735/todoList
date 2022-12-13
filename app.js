const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql');
var db  = require('./dbmsConnection.js');
const { render } = require('ejs');
const { debugPort } = require('process');
const res = require('express/lib/response');

app.use('/static',express.static('static'));
app.use(express.urlencoded());//take date from input form

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.post('/',(req,res)=>{
    
    let data= req.body;
    
    let todoList = (data.todo);
    todoList = todoList.replace(/"/g, "'");

    let inserting = `insert into todos value(${0},"${todoList}")`
        db.query(inserting,(err,data)=>{
            if(err)throw err;
            else{
                // console.log("insert successfully1");
                res.redirect('/');
            }
        })
})

app.get('/update/:id',(req,res)=>{
    let id = req.params.id;
    // console.log(id);
    let sql = `select todo,id from todos where id=${id}`;
    db.query(sql,(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);
            res.render('update',{data});
        }
    })
})

app.get('/delete/:id',(req,res)=>{
    let id = (req.params).id;
    // list id is present ?
    let sql=`select * from todos where id=${id}`
    db.query(sql,(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);

            if(data[0]!=null){
                
                let delet = `delete from todos where id=${id}`
                db.query(delet,(err2,result)=>{
                    if(err2)throw err2;
                    else{
                        res.redirect('/');
                    }
                })
            }
            else{
                res.send('list id is not found ')
            }
        }
    })
})

app.post('/update',(req,res)=>{
    let id = (req.body).id;
    let todo = (req.body).todo;

    // list id is present ?
    let sql=`select * from todos where id=${id}`
    db.query(sql,(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);
            if(data[0]!=null){
                let delet = `UPDATE todos set todo = '${todo}'  where id=${id}`
                db.query(delet,(err2,result)=>{
                    if(err2)throw err2;
                    else{
                        res.redirect('/');
                    }
                })
            }
            else{
                res.redirect('/update');
            }
        }
    })
})

app.get('/finised/:id',(req,res)=>{
    let id = req.params.id;
    // list id is present ?
    let sql=`select * from todos where id=${id}`
    db.query(sql,(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);
            if(data[0]!=null){
                let delet = `delete from todos where id=${id}`
                db.query(delet,(err3,res)=>{
                    if(err3)throw err;
                }) 

                let insert = `insert into finised value (${data[0].id},"${data[0].todo}")`
                db.query(insert,(err2,result)=>{
                    if(err2)throw err2;
                    else{
                        res.redirect('/');
                    }
                })
            }
            else{
                res.send('list id is not found')
            }
        }
    })
})

app.get('/',(req,res)=>{
    let sql = 'select * from todos';
    let finised = 'select * from finised';
    let query=db.query(sql,(err,data)=>{
        db.query(finised,(err2,data2)=>{
            if(err || err2){
                throw err;
            }
            else{
                res.render('index',{data,data2});
            }
        })
    })
})

app.get('/deleteAll_Finised_List',(req,res)=>{
    let delet = 'drop table finised'
    let table = 'CREATE TABLE finised(id int NOT NULL ,todo varchar(1000),PRIMARY KEY (id))'

    db.query(delet,(err,data)=>{
        if(err)throw err;
        else{
            db.query(table,(err2,data2)=>{
                if(err2)throw err2;
                else{
                    res.redirect('/');
                }
            })
        }
    })

})

app.get('/deleteAll_Todos',(req,res)=>{
    let delet = 'drop table todos'
    let table = 'CREATE TABLE todos(id int NOT NULL AUTO_INCREMENT,todo varchar(1000),PRIMARY KEY (id))'

    db.query(delet,(err,data)=>{
        if(err)throw err;
        else{
           db.query(table,(err2,data2)=>{
                if(err2)throw err2;

                else{
                    res.redirect('/');
                }
            })
        }
    })

})


app.listen('80',()=>{
    console.log('server is started on port 80');
});
