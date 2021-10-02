const { text } = require('express');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://192.168.1.8:4200",
    methods: ["GET", "POST"]
  }
});

const documents = {};

io.on("connection", socket => {
    let previousId;
  
    const safeJoin = currentId => {
      socket.leave(previousId);
      socket.join(currentId, () => console.log(`Socket ${socket.id} joined room ${currentId}`));
      previousId = currentId;
    };

    socket.on("getDoc", docId => {
        safeJoin(docId);
        //console.log("Has Key "+docId+": "+containsID(docId));
        if(!containsID(docId)){
          errorMsg = "Can't Find session with entered ID";
          socket.emit("error", errorMsg);
        }else{
        socket.emit("document", documents[docId]);
        errorMsg = "";
        socket.emit("error", errorMsg);
        }
        
      });

    socket.on("addDoc", doc => {
        doc.id = getDocId();
        documents[doc.id] = doc;
        safeJoin(doc.id);
        io.emit("documents", Object.keys(documents));
        socket.emit("document", doc);
    });

    socket.on("editDoc", doc => {
        documents[doc.id] = doc;
        socket.to(doc.id).emit("document", doc);
      });
    io.emit("documents", Object.keys(documents));

    console.log(`Socket ${socket.id} has connected`);
    
  
    // ...http://localhost:4200/
  });

 function containsID(docID){
  
    if(Object.keys(documents).length === 0){
      return false;
    }

    for(const key in documents){
      if(documents[key].id === docID){
        return true;
      }
    }

  return false;
 }
 function docId() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getDocId(){
  let again = true;
  let t = '';
  do{
    t = docId();
    
    if(!containsID(t)){
      again = false;
    }

  }while(again);
  return t;

}


  http.listen(4444, () => {
    console.log('Listening on port 4444');
  });