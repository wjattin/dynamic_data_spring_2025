//initialize express
const express = require('express')

const app = express()

const multer = require('multer')

const bodyParser = require('body-parser');

const { Sequelize, Model, DataTypes } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});


// Define ProfileImage model
const ProfileImage = sequelize.define('ProfileImage', {
  url: DataTypes.STRING,
});

// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Sync models with database
sequelize.sync();

//initialize handlebars
const handlebars = require('express-handlebars')
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')

//set the server port
const port = process.env.port || 3000 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })

//create routes 
app.get('/', (req,res)=>{
    res.type('text/html')
    res.render('page')
})

app.post('/profile', upload.single('avatar'), async (req, res) => {
    // req.file is the name of your file in the form above, here 'avatar'
    // req.body will hold the text fields, if there were any 
    console.log(req.file, req.body)
    console.log(req.file.originalname)
    console.log(req.file.mimetype)
    res.type('text/html')
    //res.send('uploaded!!')
    const image = await ProfileImage.create({'url' :req.file.path});
    res.json(image);
     
  });
  // CRUD routes for User model
app.get('/profile', async (req, res) => {
  const image = await ProfileImage.findAll();
  res.json(image);
});
app.get('/profile/:id', async (req, res) => {
  const image = await ProfileImage.findByPk(req.params.id);
  res.json(image);
});
app.get('/profile/delete/:id', async (req, res) => {
  const image = await ProfileImage.findByPk(req.params.id);
  image.destroy()
  res.json(image)
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

