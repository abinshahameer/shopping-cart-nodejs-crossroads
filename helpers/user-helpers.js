var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const Razorpay=require('razorpay')

var instance = new Razorpay({
    key_id: 'rzp_test_Wlja71Ph69DNOp',
    key_secret: 'zRK1seNVmabRzHA6Sofpj0uI',
  });

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
             userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
               
            resolve(data.ops[0])
        })
    })


        },
        doLogin:(userData)=>{
            return new Promise(async(resolve,reject)=>{
                let loginStatus=false
                let response={}
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
                if(user){
                    bcrypt.compare(userData.Password,user.Password).then((status)=>{
                        if(status){
                            console.log("login success")
                            response.user=user
                            response.status=true
                            resolve(response)
                        }
                        else{
                            console.log("login failed")
                            resolve({status:false})
                        }
                })
            }
                else{
                    console.log("login failed")
                    resolve({status:false})
                }
               
            })
        },
      addToCart:(proId,userId)=>{
          let proObj={
              item:ObjectId(proId),
              quantity:1
          }
          return new Promise(async(resolve,reject)=>{
              let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
              if(userCart){
                  let proExist=userCart.products.findIndex(product=>product.item==proId)
                  if(proExist!=-1)
                  {
                      db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
                      {
                          $inc:{'products.$.quantity':1}
                      }).then(()=>{
                          resolve()
                      })
                  }
                  else
                  {
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
                {
                   
                        $push:{
                            products:proObj
                        }
                    
                }
                ).then((response)=>{
                    resolve()
                })
              }}
              else{
                  let cartObj={
                      user:ObjectId(userId),
                      products:[proObj]
                  }
                  db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                      resolve()
                  })
              }
          })
      } ,
      getCartProducts:(userId)=>{
          return new Promise(async(resolve,reject)=>{
              let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                 { $match:{user:ObjectId(userId)}},

                 {
                     $unwind:'$products'
                 },
                 {
                     $project:{
                         item:'$products.item',
                         quantity:'$products.quantity',
                     }
                    },
                  
                     
                        { $lookup:{
                             from:collection.PRODUCT_COLLECTION,
                             localField:'item',
                             foreignField:'_id',
                             as:'product'
                             }
                          
                     },
                     {
                         $project:{
                             item:1,quantity:1,product:{ $arrayElemAt:['$product',0]}
                         }
                     }
                    
                    
                
              ]).toArray()
              resolve(cartItems)
          })
      },
      getCartCount:(userId)=>{
          return new Promise(async(resolve,reject)=>{
              let count=0
let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
if (cart){
    count=cart.products.length
}
resolve(count)
          })
      } ,
changeProductQuantity:(details)=>{
         details.count=parseInt(details.count)
         details.quantity=parseInt(details.quantity)
         return new Promise((resolve,reject)=>{
             if(details.count==-1 && details.quantity==1)
             {

            db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},{

$pull:{products:{item:ObjectId(details.product)}}

            } 
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        }
        else{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)},
            {
                $inc:{'products.$.quantity':details.count}
            }
            
            
            
            ).then((response)=>{
                resolve({status:true})
            })

        }
            
           

         })
     } ,
     getTotalAmount:(userId)=>{

        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
               { $match:{user:ObjectId(userId)}},

               {
                   $unwind:'$products'
               },
               {
                   $project:{
                       item:'$products.item',
                       quantity:'$products.quantity',
                   }
                  },
                
                   
                      { $lookup:{
                           from:collection.PRODUCT_COLLECTION,
                           localField:'item',
                           foreignField:'_id',
                           as:'product'
                           }
                        
                   },
                   {
                       $project:{
                           item:1,quantity:1,product:{ $arrayElemAt:['$product',0]}
                       }
                   },
                   {
                       $group:{
                           _id:null,
                           total:{$sum:{$multiply:['$quantity','$product.Price']}}
                       }
                   }
                  
                  
              
            ]).toArray()
            console.log(total)
            resolve(total[0].total)
        })

     },
     placeOrder:(order,products,total)=>{
         return new Promise((resolve,reject)=>{
             let status=order['payment-method']==='COD'?'placed':'pending'
             let orderObj={
                 deliveryDetails:{
                     mobile:order.mobile,
                     address:order.address,
                     pincode:order.pincode,
                 },
                 userId:ObjectId(order.userId),
                 paymentmethod:order['payment-method'],
                 products:products,
                 totalAmount:total,
                 status:status,
                 date:new Date
             }
             db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                 db.get().collection(collection.CART_COLLECTION).removeOne({user:ObjectId(order.userId)})
                 resolve(response.ops[0]._id)
             })

         })

     },
     getCartProductList:(userId)=>{
         return new Promise(async(resolve,reject)=>{
             let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
             resolve(cart.products)
         })
     },
     getUserOrders:(userId)=>{
         return new Promise(async(resolve,reject)=>{
             console.log(userId)
             let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)}).toArray()
             console.log(orders)
             resolve(orders)
         })
     },
     getOrderproducts:(orderId)=>{
         return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $match:{_id:ObjectId(orderId)}},

                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                    }
                   },
                 
                    
                       { $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                            }
                         
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{ $arrayElemAt:['$product',0]}
                        }
                    }
                   
                   
               
             ]).toArray()
             resolve(orderItems)
         })
     },
     generateRazorpay:(orderId,total)=>{
         return new Promise((resolve,reject)=>{
            var options = {
                amount: total,  // amount in the smallest currency unit
                currency: "INR",
                receipt:"order"+ orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err)
                }
                else{
                console.log(order);
                resolve(order)
                }
              });
         })
     }
}





// getCartProducts:(userId)=>{
//     return new Promise(async(resolve,reject)=>{
//         let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
//            { $match:{user:ObjectId(userId)}},
//            {
//                $lookup:{
//                    from:collection.PRODUCT_COLLECTION,
//                    let:{prodList:'$products'},
//                    pipeline:[{

//                       $match:{
//                           $expr:{
//                               $in:['$_id',"$$prodList"]
                             
//                           }
//                       }

//                    }],
//                    as:'cartItems'
//                }
//            }
//         ]).toArray()
//         resolve(cartItems[0].cartItems)
//     })
// },