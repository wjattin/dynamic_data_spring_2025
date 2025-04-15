//initialize express
const express = require('express')

const app = express()

//import body-parser
const bodyParser = require('body-parser')

//Define our models and init database 
const { Sequelize , Model, DataTypes } = require('sequelize')
//Create a sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
})   
// Create your first Model
const Customer = sequelize.define('Customers',
  {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
  })

 const Order = sequelize.define('Orders', {
  size: DataTypes.STRING,
  toppings: DataTypes.STRING,
  notes: DataTypes.STRING,
  total: DataTypes.NUMBER,
  status: DataTypes.STRING,
}) 

// Make the relationship to Customer
Order.belongsTo(Customer)
Customer.hasMany(Order)

//Initialize bodyparser.. converts POST request objects to json
app.use(bodyParser.urlencoded({extended:true}))
//app.use(bodyParser.json())

//sync the models to the database
sequelize.sync()

//initialize handlebars
const handlebars = require('express-handlebars')
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')

//set the server port
const port = process.env.port || 3000 

//create routes 
app.get('/', (req,res)=>{
    res.type('text/html')
    res.render('page')
})
// C R U D
//create a customer
app.get('/customer/create', (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  res.type('text/html')
  res.render('customer')
});
// C create
app.post('/customer/create', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  console.log(req.body)
  //before creating the record, we can check for errors of missing information
  const newCustomer = await Customer.create({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    email: req.body.email,
    phone: req.body.phone,
   });
  res.type('text/html')
  //redirect to the customers list
  res.redirect('/customers')
  // res.render('customers',{customers})
});
// R read  
//display all customers
app.get('/customers', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  const customers = await Customer.findAll().then((data)=>{
    console.log(data)
    res.type('text/html')
    res.render('customers',{"customers":data})
  });
});
//display specific customer by id.. also a R read operation
app.get('/customer/details/:id', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  const customers = await Customer.findOne({where: {id: req.params.id},raw:true}).then((data)=>{
    console.log("data")
    console.log(data)
    console.log("********")
    res.type('text/html')
    res.render('customerdetails',{"customers":data})
  });
});
//edit a customer
app.get('/customer/edit/:id', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  const customers = await Customer.findOne({where: {id: req.params.id},raw:true}).then((data)=>{
    console.log("data")
    console.log(data)
    console.log("********")
    res.type('text/html')
    res.render('customer',{"customers":data})
  });
});

app.post('/customer/edit', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  console.log(req.body)
  const customers = await Customer.findByPk(req.body.id);
  console.log(customers)
  console.log(req.body.id)
  await customers.update({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    email: req.body.email,
    phone: req.body.phone,
   }).then(()=>{
    customers.save()
    res.type('text/html')
    //redirect to the customers list
    res.redirect('/customers')
   });

});  
// D delete a customer 
app.get('/customer/delete/:id', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  const customers = await Customer.findByPk(req.params.id);
  customers.destroy();
  res.type('text/html')
  //res.send('cusromer ' + req.params.id + ' has been deleted')
  res.redirect('/customers')

});
// Order process
//create an order .. we need to pass the customer's id to relate it to the order
app.get('/order/create/:id', async (req, res) => {
  //get the customer
  const customer = await Customer.findOne({where: {id: req.params.id},raw:true}).then((data)=>{
    console.log("data")
    console.log(data)
    console.log("********")
    res.type('text/html')
    res.render('order',{"customer":data})
  });
})
app.post('/order/create', async (req,res) => {

  console.log(req.body)

  let total = 0.0
  let size = req.body.size 
  let toppings = req.body.toppings

  if(size == 'S' ) {
    total += 10.00
  } else if(size == 'M' ) {
    total += 15.00
  } else if(size == 'L' ) {
    total += 18.00
  } else if(size == 'XL' ) {
    total += 22.00
  }  
  toppings.forEach( (value) =>{ 
    if(value == 'ham') {
      total += 3.50
    }  
    if(value == 'pepperoni') {
      total += 3.00
    }  
    if(value == 'mushrooms') {
      total += 2.00
    }  
  })
  // find the customer we are adding this order to
  const customer = await Customer.findByPk(req.body.cid)
  //we can do some error checking
  //add the order to the customer object
  const newOrder = await customer.createOrder({
    size: size,
    toppings: toppings.toString(),
    notes: req.body.notes,
    total:total,
    status:req.body.status
  })
  res.type('text/html')
  res.redirect('/orders')
})
app.get('/orders', async (req,res)=>{
  // Object relation: Brings the information of the customer with the order
  const orders = await Order.findAll({include:[{model:Customer,required:true}]}).then((data) => {
    console.log(data)
    res.type('text/html')
    res.render('orders',{'orders':data})
  })
})


app.get('/order/details/:id', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  const order = await Order.findOne({where: {id: req.params.id}, include:[{model:Customer,required:true}]}).then((data)=>{
    console.log("data")
    console.log(data)
    console.log("********")
    res.type('text/html')
    res.render('orderdetails',{"order":data})
  });
});

app.get('/order/edit/:id', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  const order = await Order.findOne({where: {id: req.params.id}, include:[{model:Customer,required:true}]}).then((data)=>{
    // We need to process some data in order to populate the order form
    //console.log(data)
    let customer = data.getDataValue('Customer')
    let order = {
      id: data.getDataValue('id'),
      size: data.getDataValue('size'),
      toppings: [], // We will tak ecare of the toppings next
      total: data.getDataValue('total'),
      notes: data.getDataValue('notes'),
      status: data.getDataValue('status')
    }
    let tmpToppings = data.getDataValue('toppings').split(",")
    tmpToppings.forEach((topping)=>{
      order.toppings.push(topping)
    }) 

    console.log("order")
    console.log(order)
    console.log(customer)
    
    console.log("********")
    res.type('text/html')
    res.render('order',{"order":order,"customer":customer})
  });
});


app.post('/order/edit', async (req,res) => {

  console.log(req.body)

  let total = 0.0
  let size = req.body.size 

  let toppings = req.body.toppings

  if(size == 'S' ) {
    total += 10.00
  } else if(size == 'M' ) {
    total += 15.00
  } else if(size == 'L' ) {
    total += 18.00
  } else if(size == 'XL' ) {
    total += 22.00
  }
  //Toppings might be missing if no toppings were checked 
  if(typeof(toppings) != 'undefined'){  
  toppings.forEach( (value) =>{ 
    if(value == 'ham') {
      total += 3.50
    }  
    if(value == 'pepperoni') {
      total += 3.00
    }  
    if(value == 'mushrooms') {
      total += 2.00
    }  
  })
} else {
  //set the value of toppings to none 
  toppings = "None"
} 
  // find the order we are adding this order to
  const order = await Order.findByPk(req.body.id)
  //we can do some error checking
  //add the order to the customer object
  const newOrder = await order.update({
    size: size,
    toppings: toppings.toString(),
    notes: req.body.notes,
    total:total,
    status:req.body.status
  })
  res.type('text/html')
  res.redirect('/orders')
})

app.post('/order/edit', async (req, res) => {
  // req.file is the name of your file in the form above, here 'avatar'
  // req.body will hold the text fields, if there were any 
  console.log(req.body)
  const order = await Order.findByPk(req.body.id);
  console.log(order)
  console.log(req.body.id)
  await order.update({
    size: req.body.size,
    toppings: req.body.toppings.toString(),
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    email: req.body.email,
    phone: req.body.phone,
   }).then(()=>{
    customers.save()
    res.type('text/html')
    //redirect to the customers list
    res.redirect('/customers')
   });

});   
//set up error handling 
//not found 
app.use((req,res)=>{
    res.type('text/html')
    res.status(404)
    res.send('not found')
})
//server errors 
app.use( (error,req,res,next)=>{
    res.type('text/html')
    res.status(500)
    res.send('server error')
})

app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}  ctrl + c to terminate`)
})

