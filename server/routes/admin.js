const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const adminLayout = '../views/layouts/admin';


/* Check Login*/
const authMiddleware = (req, res, next ) => {
    const token = req.cookies.token;
  
    if(!token) {
      return res.status(401).json( { message: 'Unauthorized'} );
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).json( { message: 'Unauthorized'} );
    }
  }


// GET admin page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog Created with NodeJs, Express and MongoDb"
        };
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

// POST Admin Check - Login
router.post('/admin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne( { username } );
  
      if(!user) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }

      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  });

// GET Dashboard
router.get('/dashboard',authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title : 'dashboard',
            description: "Simple Blog Created with NodeJs, Express and MongoDb"
        }
        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        
    }

});


/*GET Admin Create Post*/
router.get('/add-post',authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title : 'Add Post',
            description: "Simple Blog Created with NodeJs, Express and MongoDb"
        }
        res.render('admin/add-post',{
            locals,
            layout:adminLayout
        })
    } catch (error) {
        
    }

});


/*Post post-data*/
router.post('/add-post',authMiddleware, async (req, res) => {
    
    try {

        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard')
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error)
    }

});



/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
  /**
   * PUT /
   * Admin - Create New Post
  */
  router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
  
      res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
      console.log(error);
    }
  
  });



// POST Register Check - SignUp
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashPassword });
            res.status(201).json({ message: 'User Created', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'Username already in use' });
            } else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    } catch (error) {
        console.log(error);
    }
});

/*
Admin Delete Post*/

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });

/*GET Logout */

router.get('/logout' , (req , res)=>{
  res.clearCookie('token');
  res.redirect('/')
})
  

module.exports = router;
