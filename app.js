const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const mysql = require('mysql');
var db  = require('./dbmsConnection.js');
const { render } = require('ejs');
const { debugPort } = require('process');
const res = require('express/lib/response');

app.use('/static',express.static('static'));
app.use(express.urlencoded());//take date from input form

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.get('/',(req,res)=>{
    if(req.session.loggedin==false)res.render('login');
    else res.redirect('/home');
});

app.post('/logout',(req,res)=>{
	req.session.loggedin = false;
    res.redirect('/');
})

app.get('/login',(req,res)=>{
    let id = (req.body).email;
    req.session.loggedin=false;
    res.render('login');
})

app.post('/login',(req,res)=>{
    let id = (req.body).email;
    res.render('login');
})
app.get('/signUp',(req,res)=>{
     req.session.loggedin=false;
    res.render('signup');
});

app.post('/signup',(req,res)=>{
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    db.query('SELECT * FROM users WHERE email = ?',[email],(err,result)=>{
        if(err){
            throw err;
        }
        else if(result.length > 0){
            res.send(`this ${email} address already exist please Enter another email Id for signUp`);
        }
        else{
            let sql = 'INSERT INTO users (name,email,password) VALUES (?,?,?)';
            db.query(sql,[name,email,password],(err2,data)=>{
                if(err2){
                    throw err2;
                }
                else{
                    req.session.loggedin = true;
                    req.session.username = name;
                    req.session.email = email;
                    res.redirect('/home');
                }
            })
        }
    })
});


// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let email = request.body.email;
	let password = request.body.password;

    // console.log(email+" "+password);

	// Ensure the input fields exists and are not empty
	if (email && password) {
		// Execute SQL query that'll select the account from the database based on the specified email and password
		db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = results[0].name;
				request.session.email = results[0].email;
				// Redirect to home page
				response.redirect('/home')
			} else {
				response.send('Incorrect email and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter email and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
        var email = request.session.email;
        // response.send(email);
        db.query('SELECT * FROM todolist WHERE email = ?', [email], (err, data)=>{
            db.query('SELECT * FROM finised WHERE email = ?', [email], (err2, data2)=>{
                if(err){
                    throw err;
                }
                else if(err2){
                    throw err2;
                }
                else{
                    response.render('index',{data,data2});
                }
            })
        })

        
	} else {
		// Not logged in
		return response.redirect('/login')
	}

});

app.post('/home',(req,res)=>{
    
    let data= req.body;
    
    let todoList = (data.todo);
    todoList = todoList.replace(/"/g, "'");

    let inserting = `insert into todolist (todo,email) value("${todoList}","${req.session.email}")`
        db.query(inserting,(err,data)=>{
            if(err)throw err;
            else{
                // console.log("insert successfully1");
                res.redirect('/home');
            }
        })
});


app.get('/home/update/:id',(req,res)=>{
    let id = req.params.id;
    let email = req.session.email 
    // console.log(id);
    let sql = `select todo,id from todolist where id= ? and email = ?`;
    db.query(sql,[id,email],(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);
            res.render('update',{data});
        }
    })
});

app.post('/home/update',(req,res)=>{
    let id = (req.body).id;
    let todo = (req.body).todo;
    let email = req.session.email 

    // list id is present ?
    let sql = `select todo,id from todolist where id= ? and email = ?`;
    db.query(sql,[id,email],(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);
            if(data[0]!=null){
                let delet = `UPDATE todolist set todo = ?  where id= ? and email = ? `
                db.query(delet,[todo,id,email],(err2,result)=>{
                    if(err2)throw err2;
                    else{
                        res.redirect('/home');
                    }
                })
            }
            else{
                res.redirect('/home/update');
            }
        }
    })
})


app.get('/home/delete/:id',(req,res)=>{
    let id = (req.params).id;
    let email = req.session.email;
    // list id is present ?
    let sql=`select * from todolist where id=? and email = ?`
    db.query(sql,[id,email],(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);

            if(data[0]!=null){
                
                let delet = `delete from todolist where id=? and email = ?`
                db.query(delet,[id,email],(err2,result)=>{
                    if(err2)throw err2;
                    else{
                        res.redirect('/home');
                    }
                })
            }
            else{
                res.send('list id is not found ')
            }
        }
    })
})

app.get('/home/finised/:id',(req,res)=>{
    let id = req.params.id;
    let email = req.session.email;

    // console.log(id);
    // list id is present ?
    let sql=`select * from todolist where id=? and email = ?`
    db.query(sql,[id,email],(err,data)=>{
        if(err)throw err;
        else{
            // console.log(data[0]);
            if(data[0]!=null){
                let delet = `delete from todolist where id= ? and email = ?`
                db.query(delet,[id,email],(err3,res)=>{
                    if(err3)throw err;
                }) 

                let insert = `insert into finised (id,todo,email) values (${id},"${data[0].todo}","${email}")`
                db.query(insert,(err2,result)=>{
                    if(err2)throw err2;
                    else{
                        res.redirect('/home');
                    }
                })
            }
            else{
                res.send('list id is not found')
            }
        }
    })
})

app.get('/home/deleteAll_Finised_List',(req,res)=>{
    let delet = 'truncate table finised';
    db.query(delet,(err,data)=>{
        if(err)throw err;
        else{
            res.redirect('/home');
        }
    })
})

app.get('/home/deleteAll_Todos',(req,res)=>{
    let delet = 'truncate table todolist'

    db.query(delet,(err,data)=>{
        if(err)throw err;
        else{
            res.redirect('/home');
        }
    })
})

app.listen('80',()=>{
    console.log('server is started on port 80');
});


//--------------------------------------------- previous code ----------------------------------------------//
