import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../../models/productModel.js';
import { isAuth, isSeller } from '../../utils.js';
import path from 'path';
import multer from 'multer';

const productCreateRouter = express.Router()

 const storage = multer.diskStorage({
    destination: './uploads/images',
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + '-' + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const upload = multer({ storage: storage });


productCreateRouter.post(
    '/create',
    upload.single('image'),
    isAuth,
    expressAsyncHandler( async(req,res) => {
        const {name,brand,category,description,price,countInStock,createdBy,rating,numReviews} = req.body;
        const image = req.file.filename;

        const product = new Product({
            name:name,
            slug:name,
            image,
            brand,
            category,
            description,
            price,
            countInStock,
            rating,
            numReviews,
            createdBy: req.user._id
        });
        product.save(((error,product) => {
            if(error){
                res.status(400).send({message: "product is not create"})
            }
            if(product){
                res.status(200).send({message: "product is create successfully"})
            }
        }));
    })
)

productCreateRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler( async(req,res) => {
        const data = await Product.find({createdBy:req.user._id});
        
        if(data){
            res.send(data);
        } else {
            res.status(404).send({message: "Product Not Found"});
        }
    })
)

productCreateRouter.put(
    '/:id',
    isAuth,
    isSeller,
    expressAsyncHandler( async(req,res) => {
        try{
            const product = await Product.findById(req.params.id);
            if(product){
                product.name = req.body.name || product.name;
                product.slug = product.name;
                product.category = req.body.category || product.category;
                product.description = req.body.description || product.description;
                product.price = req.body.price || product.price;
                product.countInStock = req.body.countInStock || product.countInStock;
                const updateProduct = await product.save();
                res.status(201).send({message:"Product updated successfull", product:updateProduct})
            } else {
                res.status(401).send({message:"product not found"})
            }
        } catch(err){
            res.status(401).send(err)
        }
        
    })
)



export default productCreateRouter;