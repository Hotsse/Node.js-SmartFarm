const net  = require('net');
const cStruct = require('c-struct');

const deviceSchema = new cStruct.Schema({
    'id' : cStruct.type.string(16),
    'hasSupplySensor' : cStruct.type.boolean,
    'hasTHSensor' : cStruct.type.boolean,
    'temp' : cStruct.type.float,
    'humi' : cStruct.type.float
});

const serverSchema = new cStruct.Schema({
    'id' : cStruct.type.string(16),
    'hasSupplySensor' : cStruct.type.boolean,
    'hasTHSensor' : cStruct.type.boolean,
    'temp' : cStruct.type.float,
    'humi' : cStruct.type.float
});

cStruct.register('device', deviceSchema);
cStruct.register('server', serverSchema);

const deviceList = {};
const deviceInfoList = {};

const callbackList = {
    'data' : [],
    'close' : []
};

const server = net.createServer(function(client){
    client.on('data', function(buffer){
        const data = cStruct.unpackSync('device', buffer);
        const dataCallbacks = callbackList['data'];

        data.date = Date.now();

        deviceList[data.id] = client;
        deviceInfoList[data.id] = data;

        for(var i in dataCallbacks){
            dataCallbacks[i].call(this, this, data);
        }
    });

    client.on('close', function(){
        const closeCallbacks = callbackList['close'];
        for(var i in closeCallbacks){
            closeCallbacks[i].call(this, this);
        }
    });

    client.on('error', function(err){
        console.log('[Error]Device Socket: ' + err.message);
    });

    client.on('timeout', function(){

    });
});

exports.start = function(){
    server.listen(config.devicePort, function(){
        console.log('Device Socket open.');
    });
};

exports.list = function(){
    return deviceInfoList;
}

exports.supply = function(client, data){
    const buffer = cStruct.packSync('server', data);
    client.write(buffer);
};

exports.on = function(event, callback){
    if(!callbackList[event]){
        return;
    }

    callbackList[event].push(callback);
};

exports.get = function(deviceId){
    return deviceList[deviceId];
}