const express = require('express');
const router = express.Router();
const Post = require('../models/post');

/* Home Route */
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog Created by NodeJs, Express, MongoDb"
        };

        let perPage = 10;
        let page = parseInt(req.query.page) || 1;

        const data = await Post.aggregate([
            { $sort: { createdAt: -1 } }
        ])
        .skip(perPage * (page - 1))
        .limit(perPage);

        const count = await Post.countDocuments();
        const nextPage = page + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', { locals, data, current: page, nextPage: hasNextPage ? nextPage : null , currentRoute: '/' });
    } catch (error) {
        console.log(error);
    }
});

/* About Route */
router.get('/about', (req, res) => {
    res.render('about',{
        currentRoute: '/about'
    });
});

/* Post Route */
router.get('/post/:id', async (req, res) => {
    try {
        

        let slug = req.params.id;

        const data = await Post.findById({_id: slug});

        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog Created with NodeJs, Express and MongoDb"
        };
        res.render('post', { locals, data ,currentRoute: `/post/${slug}`});
    } catch (error) {
        console.log(error);
    }
});

router.post('/search' , async(req , res)=>{
    try {
        const locals = {
            title : "Search",
            description : "Simple Blog Created with NodeJs , Express & MongoDb"
        }


        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g , "");

        const data  = await Post.find({
            $or :[
                {title :{$regex : new RegExp(searchNoSpecialChar , 'i')}},
                {body: { $regex : new RegExp(searchNoSpecialChar , 'i')}}
            ]
        });
        res.render("search" , {
            data ,
            locals
        });
    } catch (error) {
        console.log(error);
       
    }
})


module.exports = router;
