global['config'] = require('./package.json').config;

const app = require('./lib/app.js').app,
      cam = require('./lib/cam.js'),
      devices = require('./lib/devices.js'),
      fs = require('fs');
      mysql = require('mysql'),
      server = require('./lib/app.js').server
      weather = require('./lib/weather.js');

const connection = mysql.createConnection(config.mysql);
const connectionValve = mysql.createConnection(config.mysql);

cam.init(server, config.cam);

devices.on('data', function(client, deviceData){
    weather.get().then(function(weatherData){
        const data = {
            isSupply : true
        };
        devices.send(client, data);
    });
});

app.get('/test', function(req, res){
    let code = fs.readFileSync('./test.html');
    console.log(code);
    res.send(code.toString());
});

app.get('/cam', function(req, res){
    let code = fs.readFileSync('./cam.html');
    console.log(code);
    res.send(code.toString());
});

app.post('/', function(req, res){
    if(config.id === req.body.id){
        weather.get().then(function(weatherData){
            res.json({ success:true, devices:devices.list(), weather:weatherData });  
        });
    }else{
        res.json({ success:false, message:'Access Denied.' });  
    }
});

app.post('/notice', function(req, res){
    if(config.id === req.body.id){
        let query = 'SELECT * FROM board';
        if(req.body.offset){ query += 'OFFSET='+req.body.offset; }
        if(req.body.limit){ query += 'LIMIT='+req.body.limit; }

        connection.connect();
        connection.query(query, function(err, rows, fields){
            if(err){
                res.json({ success:false, message:err.message });  
            }else{
                res.json({ success:true, notice:rows });
            }
        });
        connection.end();
        
    }else{
        res.json({ success:false, message:'Access Denied.' });   
    }
});

app.post('/notice/write', function(req, res){
    if(config.id === req.body.id){
        if(!req.body.title || req.body.title === ''){ res.json({ success:false, message:'제목을 입력하세요.' }); }
        if(!req.body.content || req.body.content === ''){ res.json({ success:false, message:'내용을 입력하세요.' }); }

        let title = req.body.title.replace(/\n/, '\\n').replace(/\"/,'\"'),
            content = req.body.content.replace(/\n/, '\\n').replace(/\"/,'\"');

        let query;

        if(!req.body.seq){ query = 'INSERT INTO board (title, content) VALUES ("'+title+'", "'+content+'")'; }
        else{ query = 'UPDATE board SET (title, content) = ("'+title+'", "'+content+'") WHERE seq='+req.body.seq; }
        console.log(query);
        connection.connect();
        connection.query(query, function(err, rows, fields){
            if(err){
                res.json({ success:false, message:err.message });  
            }else{
                let message = '글 ' + ((req.body.seq)? '수정':'입력' ) + '을 성공하였습니다.';
                res.json({ success:true, message:message });
            }
        });
        connection.end();
    }else{
        res.json({ success:false, message:'Access Denied.' });  
    }
});

app.post('/version', function(req, res){
    if(config.id === req.body.id){
        res.json({ success:true, version:{ major:1, minor:0, minor2:0 } });
    }else{
        res.json({ success:false, message:'Access Denied.' });  
    }
});


app.post('/valve', function(req, res){
    if(config.id === req.body.id){
        let query = 'SELECT state FROM valve ORDER BY idx DESC LIMIT 1';
        if(req.body.offset){ query += 'OFFSET='+req.body.offset; }
        if(req.body.limit){ query += 'LIMIT='+req.body.limit; }

        //connectionValve.connect();
        connectionValve.query(query, function(err, rows, fields){
            if(err){
                res.json({ success:false, message:err.message });  
            }else{
                res.json({ success:true, valve:rows });
            }
        });
        //connectionValve.end();
        
    }else{
        res.json({ success:false, message:'Access Denied.' });   
    }
});


app.post('/valve/write', function(req, res){
    if(config.id === req.body.id){
        if(!req.body.state || req.body.state === ''){ res.json({ success:false, message:'plz insert valve state[ON:OFF]' }); }
        if(req.body.state != 'ON' && req.body.state != 'OFF'){ res.json({ success:false, message:'Invalid Value' }); }

        let state = req.body.state.replace(/\n/, '\\n').replace(/\"/,'\"');

        let query;

        query = 'INSERT INTO valve (state) VALUES ("'+state+'")';
        console.log(query);
   
        connectionValve.query(query, function(err, rows, fields){
            if(err){
                res.json({ success:false, message:err.message });  
            }else{
                res.json({ success:true, valve:req.body.state });
            }
        });
        
    }else{
        res.json({ success:false, message:'Access Denied.' });  
    }
});
