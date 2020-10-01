var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
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
  res.render('index', { products,admin:false });
});

module.exports = router;