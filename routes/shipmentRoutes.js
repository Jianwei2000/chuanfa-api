import express from "express";

const router = express.Router();

router.post('/711', function (req, res) {
 const selectedStore = {
  id: req.body.storeid,     
  name: req.body.storename,  
  address: req.body.storeaddress, 
 }

 console.log("選擇的門市資訊:",selectedStore);

 res.send(`
 <html>
      <head>
        <script>
          const selectedStore = ${JSON.stringify(selectedStore)};
          window.opener.postMessage(selectedStore, "*");
          window.close();
        </script>
      </head>
      <body>
        <p>傳送門市資訊中，請稍候...</p>
      </body>
    </html>
`);

});

export default router;