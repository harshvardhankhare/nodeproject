const express = require("express");
const path = require("path");
require("./db/connect");
const ejs = require("ejs");
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/users");
const app = express();
const authRoutes = require("./routes/auth");
const Blog = require("./models/blog")
const Comment = require('./models/comment');
const { initializingPassport, isAuthenticated } = require("./routes/passportconfig");
const port = process.send.PORT || 3000;
const fileUpload = require("express-fileupload");



app.use(fileUpload({
  useTempFiles:true
}));

app.use("/static", express.static("public"))
const templatepath = path.join(__dirname, "../templates/views");
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.set("views", templatepath);
app.use("/auth",authRoutes)
initializingPassport(passport);
app.use(session({secret:"secret", resave:"false", saveUninitialized :"false"}))
app.use(passport.initialize());
app.use(passport.session());


app.get("/", async (req, res) => {

  try {
    const blogs = await Blog.find({}).populate('author');
    const recentPost= await Blog.find().sort({ createdAt: -1 }).limit(10).populate('author');
    
    res.render('index', { blogs,recentPost });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }

});
app.get('/search', async (req, res) => {
  try {
    let blogs;

    // Check if a search query parameter is present
    if (req.query.search) {
      // If a search query is provided, use it to search blogs by name
      const searchQuery = req.query.search;
      blogs = await Blog.find({ title: { $regex: searchQuery, $options: 'i' } }).populate('author');
    } else {
      // If no search query is provided, you can handle it accordingly (e.g., display a message)
      // You can redirect the user back to the home page or display a message indicating no search query.
      return res.redirect('/');
    }

    res.render('searchResults', { blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get("/contact", (req, res) => {
    res.render("contact");

})


app.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author');
    await blog.populate('comments')

    await blog.populate({
     path: 'comments',
     populate: {
       path: 'commenter',
       model: 'User', // Replace 'User' with your actual User model name
       // Make sure to select the 'name' field of the User model
     },
   })
    res.render('blogDetails', { blog });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
  });
  app.post('/user/:id/create-blog', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Create a new blog post
      const newBlog = {
        title: req.body.title,
        content: req.body.content,
      };
  
      user.blogs.push(newBlog);
      await user.save();
  
      res.redirect(`/user/${user._id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });


app.get('/blog/harsh', async(req,res)=>{
try{
  
  res.render('blog', { Blog });
}catch(err){
  console.error(err);
      res.status(500).send('Internal Server Error');
}


});



//////////////////  END OF THE CODE ////////////////////


app.listen((port), () => {

    console.log(`server is running at port no ${port}`)
})
