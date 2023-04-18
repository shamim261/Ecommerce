import  express  from "express";
import expressAsyncHandler from "express-async-handler";
import Order from '../../../models/orderModel.js';
import { isAuth, isSeller } from "../../../utils.js";

const sellerOrderRouter = express.Router();

sellerOrderRouter.get(
    '/allorder',
    isAuth,
    isSeller,
    expressAsyncHandler( async(req,res) => {
        const userId = req.user._id;
        const order = await Order.find({"orderItems.seller": userId},{_id:0,orderItems:{$elemMatch:{"orderItems.seller":userId}}});
        res.send(order);
    })
)

sellerOrderRouter.get(
    '/orderaddress',
    isAuth,
    isSeller,
    expressAsyncHandler( async(req,res) => {
        const userId = req.user._id;
        const orderAddress = await Order.distinct("shippingAddress").where({"orderItems.seller": userId})
        if(orderAddress){
            res.status(200).send(orderAddress)
        } else {
            res.status(404).send({message:"data not found"})
        }
    })
)

sellerOrderRouter.put(
    '/changestatus',
    isAuth,
    isSeller,
    expressAsyncHandler( async(req,res) => {
        try{
            const userId = req.user._id;
            const newStatusCode = req.body.isDelivered;
            const product = await Order.findOneAndUpdate('isDelivered').where({"orderItems.seller": userId});
            if(product){
                product.isDelivered = newStatusCode;
                await product.save()
                res.send(product);
            } else {
                res.status(401).send({message:"not updated"})
            }
        } catch(err) {
            res.status(404).send(err);
        }
        
        
    })
)

sellerOrderRouter.get(
    '/summary',
    isAuth,
    isSeller,
    expressAsyncHandler( async(req,res) => {
        const userId = req.user._id;

        const allOrderPrice = await Order.aggregate([
            
            {
                $group: {
                    _id:null,
                    numOrders: {$sum:1},
                    totalSales: {$sum:`$orderItems.price`},
                },
            },
        ])
        res.send(allOrderPrice);
    } )
)


export default sellerOrderRouter;