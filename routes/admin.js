var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  let products = [
    {
      name: "Iphone 11",
      category: "Mobile",
      description: "This is made by apple",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-black-select-2019?wid=834&hei=1000&fmt=jpeg&qlt=95&op_usm=0.5,0.5&.v=1566956144418"
    },
    {
      name: "Iphone 10",
      category: "Mobile",
      description: "This is made by apple",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-black-select-2019?wid=834&hei=1000&fmt=jpeg&qlt=95&op_usm=0.5,0.5&.v=1566956144418"
    },
    {
      name: "Iphone 7+",
      category: "Mobile",
      description: "This is made by apple",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-black-select-2019?wid=834&hei=1000&fmt=jpeg&qlt=95&op_usm=0.5,0.5&.v=1566956144418"
    },
    {
      name: "Iphone 6",
      category: "Mobile",
      description: "This is made by apple",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-black-select-2019?wid=834&hei=1000&fmt=jpeg&qlt=95&op_usm=0.5,0.5&.v=1566956144418"
    },


  ]
  res.render('admin/view-products',{admin:true,products})
});

router.get('/add-product',function(req,res){
  res.render('admin/add-product')

})
router.post('/add-product',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
})

module.exports = router;
