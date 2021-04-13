const express = require('express')
const path = require('path')
const app = express()
const port = 4000
const uri = "mongodb+srv://stockapp:88888888@cluster0.o8iuu.mongodb.net/chessapi?authSource=admin&replicaSet=atlas-yebdcz-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";
const mongoose = require('mongoose');
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(() => {
    console.log('Connected')
}).catch(err => console.log(err))
const jsChessEngine = require('js-chess-engine')
const game = new jsChessEngine.Game()
const schemaaa={
  "userId": {
    "type": "Number"
  },
  "start": {
    "type": "String"
  },
  "userMoves": {
    "type": [
      "String"
    ]
  },
  "AIMoves": {
    "type": [
      "String"
    ]
  }
}
const config = new mongoose.Schema(schemaaa,{timestamps: true});
const chessAI = mongoose.model('data', config);


app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res){
    res.render('/index.html');
});

app.get('/newgame', function (req, res){
    res.sendFile(__dirname+'/public/game.html');
    var obj={}
    obj["userId"]="9481543420"
    obj["start"]="User"
    obj["userMoves"]=[]
    obj["AIMoves"]=[]
    chessAI.create(obj, function (err, obj2) {
      if (err)
          console.log(err);
      console.log(obj2)
    });
});


app.get('/move', function(req, res){
  try {
    game.move(req.query.from,req.query.to,req.query.config)
    result = game.aiMove(0,req.query.config)
    res.json({
      move : result,
      board : game.board.configuration
    });

    objUser=`${req.query.from} : ${req.query.to}`
    objAI= JSON.stringify(result)
    chessAI.findOne({ userId: "9481543420" }).exec((err, content) => {
      content.userMoves.push(objUser)
      content.AIMoves.push(objAI)
      content.save("saved")
    })

  } catch (error) {
    res.send(`invalid-move;${req.query.to}-${req.query.from}`)
  }
});


app.get('/game/:userId', function (req, res){
  chessAI.find({ userId: req.params.userId }).exec((err, content) => {
    res.json(content)
  })
});

app.listen(port, () => {
  console.log(`Listening on port :${port}`)
})