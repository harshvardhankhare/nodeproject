const express = require("express")
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require("../models/users")
const Blog = require("../models/blog")
const Comment = require('../models/comment');
require("../db/connect");
const router = express.Router();
const path = require("path");
//const { profile } = require("console");
const bcrypt = require('bcrypt');
const { initializingPassport, isAuthenticated } = require("./passportconfig");
const blog = require("../models/blog");
const clodinary = require('cloudinary').v2
const fileUpload = require("express-fileupload");
const { Console } = require("console");

// ...


clodinary.config({
  cloud_name: 'dfesakhqh',
  api_key: '294898774391246',
  api_secret: '7wyKCCZDh4tE8FJKgQ6K-74Zal4',
  secure: true
});


initializingPassport(passport);
router.use(session({ secret: "secret", resave: false, saveUninitialized: false }))
router.use(passport.initialize());
router.use(passport.session());

router.get("/login", (req, res) => {
  res.render("login"); // Example EJS rendering
});
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/auth/login',
  successRedirect: '/auth/profile'

}), (req, res) => {
});

router.get("/signup", (req, res) => {
  res.render("signup"); // Example EJS rendering
});



router.post('/signup', async (req, res) => {

  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ name: name });
    if (user) {
      return res.status(400).send("user already exists");
    } else {
      const file = req.files.profileImage;
      clodinary.uploader.upload(file.tempFilePath, async (err, ress) => {
        const profileImage = ress.url;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newuser = new User({
          name,
          email,
          password: hashedPassword,
          profileImage
        });
        // const newuser = await User.create(req.body);
        await newuser.save();
        res.status(201).send("user created succesfully")
        res.redirect("/auth/login");
      })
    }
  } catch (error) {

  }
})






router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blogs'); // Populate the 'blogs' field with actual blog data
    const blogs = await Blog.find({}).populate('author');

    res.render('profile', { user, blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }

});

////  FOR EDITING AND DELETING THE BLOGS
// Middleware to check if the user is authenticated
router.get('/editblog', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blogs');

    res.render('editblog', { user })
  } catch (error) {
    console.log(error)
  }

})
router.get('/test-go', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    res.redirect('/auth/profile')
  } catch (error) {
    console.log(error)
  }
})
router.get('/editblog/:blogId/edit', isAuthenticated, async (req, res) => {
  try {
    // Find the user's blog post by ID
    const blog = await Blog.findById(req.params.blogId);

    // Ensure that the user owns the blog post
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      return res.status(404).send('Blog not found');
    }

    res.render('editblogpost', { blog }); // Render a page to edit the blog post
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.post('/editblog/:blogId/edit', isAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Find the user's blog post by ID
    const blog = await Blog.findById(req.params.blogId);

    // Ensure that the user owns the blog post
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      return res.status(404).send('Blog not found');
    }

    // Update the blog post with new data
    blog.title = title;
    blog.content = content;
    await blog.save();

    res.redirect('/auth/editblog');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.post('/editblog/:blogId/delete', isAuthenticated, async (req, res) => {
  try {
    // Find the user's blog post by ID
    const blog = await Blog.findById(req.params.blogId);

    // Ensure that the user owns the blog post
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      return res.status(404).send('Blog not found');
    }

    // Delete the blog post
    await Blog.deleteOne({ _id: req.params.blogId });

    res.redirect('/auth/editblog');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/profile/create-blog', async (req, res) => {
  if (!req.user) {
    res.redirect('/login');
  } else {

    const { title, content } = req.body;

    const file = req.files.blogImage;

    clodinary.uploader.upload(file.tempFilePath, async (err, ress) => {
      try {

        const blogImage = ress.url;
        const newBlog = new Blog({
          title,
          content,
          author: req.user._id,
          blogImage,
          preview: generatePreview(content),
        });

        const savedBlog = await newBlog.save();

        // Add the new blog to the user's blogs
        req.user.blogs.push(savedBlog);
        await req.user.save();

        res.redirect('/auth/profile');
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
    })

  }

});

router.get('/profile/Create-Blog', async (req, res) => {
  try {
    if (!req.user) {
      res.redirect('/auth/login'); // Redirect to login if the user is not logged in
    } else {
      console.log(req.user)
      res.render('createblog', { user: req.user });
    }
  } catch (error) {
    console.log(error)
    return
  }

})

router.get('/profile/userSearch', isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      res.redirect('/auth/login')
    } else {
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
      // res.render('searchResults', { blogs });
      res.render('userSearch', { user: req.user, blogs });
    }
  } catch (error) {
    console.log(error)
    res.render("error404")
  }
})


router.post('/blogs/:blogId/like', isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    console.log(blog)
    if (blog.likes.includes(req.user._id)) {
      return res.status(400).redirect('/auth/profile')

    }
    blog.likes.push(req.user._id);
    // Increment the likes count by 1
    await blog.save();

    // Save the updated blog with the incremented likes count

    res.status(200);
    res.redirect("/auth/profile")
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/blogs/:blogid/detail', isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      res.redirect('/auth/login')
    }

    let blog = await Blog.findById(req.params.blogid).populate('author');

    await blog.populate('comments')

    await blog.populate({
      path: 'comments',
      populate: {
        path: 'commenter',
        model: 'User', // Replace 'User' with your actual User model name
        // Make sure to select the 'name' field of the User model
      },
    })



    res.render('authenticatedblogdetail', { user: req.user, blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// for commenting on post 
router.post('/blogs/:blogId/comments', isAuthenticated, async (req, res) => {
  try {
    // Find the blog post by ID

    const blog = await Blog.findById(req.params.blogId);
    const blogid = req.params.blogId;

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Create a new comment
    const newComment = new Comment({
      text: req.body.text,
      commenter: req.user._id, // Assuming you have user authentication in place
    });

    // Save the comment
    await newComment.save();

    // Add the comment to the blog's comments array
    blog.comments.push(newComment);

    // Save the updated blog with the new comment
    await blog.save();

    res.status(201).redirect(`/auth/blogs/${blogid}/detail`)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
function generatePreview(content) {
  // Extract the first 200 characters as a preview (you can adjust the length)
  return content.substring(0, 200);
}
router.get('/allblogs', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.redirect('auth/login')
    }
    res.render('allblogs')
  } catch (err) {
    console.log(err)
  }
})

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;