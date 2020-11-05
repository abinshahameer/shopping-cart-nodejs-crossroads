var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')

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
                    {

                        $project:{
                            item:1,
                            quantity:1,
                            product:{
                                $arrayElemAt:['$product',0]

                            }

                        }

                    },
                     
                        { $lookup:{
                             from:collection.PRODUCT_COLLECTION,
                             localField:'item',
                             foreignField:'_id',
                             as:'product'
                             }
                          
                     }
                    
                    
                
              ]).toArray()
              resolve(cartItems)
          })
      },
      getCartCount:(userId)=>{
          return new Promise(async(resolve,reject)=>{
let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
if (cart){
    count=cart.products.length
}
resolve(count)
          })
      } ,
     changeProductQuantity:({details})=>{
         details.count=parseInt(details.count)
         return new Promise((resolve,reject)=>{

            db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)},
            {
                $inc:{'products.$.quantity':details.count}
            }).then(()=>{
                resolve()
            })

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