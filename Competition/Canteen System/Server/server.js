const express = require("express");
const bodyParser = require('body-parser');
var multiparty = require('multiparty');

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');

app.use('/', express.static("Order"));
app.use('/orders', express.static("database"));
app.use('/login', express.static("Login"));
app.use('/admin', express.static("Admin"));
app.use('/data', express.static("Data"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/submit', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(400).send('Username and password are required.');
  }
  
  var data = fs.readFileSync('test.json');
  data = JSON.parse(data);
  newUser = {
    "username": username,
    "password": password
  }

  data.users.push(newUser);
  var newData = JSON.stringify(data);
  res.send(`Received: Username - ${username}, Password - ${password} FULL: ${newData}`);

  fs.writeFile('test.json', newData, err => {
    if(err) throw err;
  });   
});

app.post('/doneOrder', (req, res) => {
  var index = req.body.orderIndex.split(",");
  var data = fs.readFileSync('Data/orders.json');
  data = JSON.parse(data);

  data.orders[index[0]].order[index[1]].done = data.orders[index[0]].order[index[1]].done ? false : true;
  console.log(data.orders[index[0]].order[index[1]])
  var newData = JSON.stringify(data);
  fs.writeFile('Data/orders.json', newData, err => {
    if(err) throw err;
    console.log(`Order: ${req.body.orderIndex} ${data.orders[index[0]].order[index[1]].done ? "Undone" : "Done"}.`);
  });   
});

app.post('/newOrder', (req, res) => {
  var name = req.body.name;
  var className = req.body.class;
  var time = req.body.time;
  var orders = () => {
    let order = req.body.orders.split("/")
    for (i = 0; i < order.length; i++) {
      order[i] = {
        "done": false,
        "index": order[i].split(",")}
    }
    return order;
  };

  const newObject = {
    "name": name,
    "class": className,
    "order": orders(),
    "time": time
  };
  
  var data = fs.readFileSync('Data/orders.json');
  data = JSON.parse(data);
  data.orders.push(newObject);
  var newData = JSON.stringify(data);
  fs.writeFile('Data/orders.json', newData, err => {
    if(err) throw err;
  });
})

app.post('/newUser', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var className = req.body.class;
  
  var data = fs.readFileSync('Data/users.json');
  data = JSON.parse(data);
  data.users.push({
    "username": username,
    "password": password,
    "class": className
  });
  var newData = JSON.stringify(data);
  fs.writeFile('Data/users.json', newData, err => {
    if(err) throw err;
  });
});

app.post('/editItem', (req, res) => {
  var name, price, image, index;
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
      name = fields.name[0];
      price = fields.price[0];
      index = fields.index[0].split(",");
      image = files.image[0];

      saveData();
  });

  function saveData() {
    var data = fs.readFileSync('Data/items.json');
    data = JSON.parse(data);
    data.subMenu[index[0]][index[1]] = name;
    data.subMenuPrice[index[0]][index[1]] = Number(price);
    
    fs.rename(image.path, `Data/ItemImage/${index.join(",")}.png`, function (err) {
      if (err) throw err;
    });

    fs.writeFile('Data/items.json', JSON.stringify(data), err => {
      if(err) throw err;
    });
  }
})

// app.get('/test', (req, res) => {
//   res.sendFile(__dirname + '/Database/index.html')
// })

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});