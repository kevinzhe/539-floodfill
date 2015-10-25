var main = function(ex) {
    window.ex = ex;
    //ex.data.meta.mode = "demo"
    //ex.data.meta.mode = "assessment1"
    //ex.data.meta.mode = "assessment2"
    ex.data.meta.mode = "selfTest"
    var objects = []
    var onTimer = ex.onTimer(200,function(){});
    ex.stopTimer(onTimer);

    function shuffle(array) {
        var counter = array.length, temp, index;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }


    /* Directions */
    var UP      = 'up';
    var DOWN    = 'down';
    var RIGHT   = 'right';
    var LEFT    = 'left';

    /* Return statuses */
    var OFF_BOARD   = 'off';
    var FILLED      = 'fill';
    var BLOCKED     = 'block';
    var MOVED       = 'move';
    var DONE        = 'done';


    var arrows  = [] //I couldn't find a better way to wipe the arrows.
                    // I'll explain when we meet up.
    var margin = 20
    /* Initialize our model fields */
    var model = {};
    var code = {};

    var code = {
            dirOrder : [],
            answer   : [],
            dropdowns: [],
            init: function(){
                dirOrder = model.dirOrder
                if(ex.data.meta.mode == "assessment2"){
                    for(var i = dirOrder.length-1; i >=0; i--){
                        code.dropdowns.push(ex.createDropdown(2*ex.width()/3,
                                         (4-i)*ex.height()/6, "",
                                         {size:"Large",
                                         elements :{
                                         "up"   : makeSelection(i,"up"),
                                         "down" : makeSelection(i,"down"),
                                         "left" : makeSelection(i,"left"),
                                         "right": makeSelection(i,"right")}}
                                         ));
                    }
                }
            },
            draw: function(){
                ex.graphics.ctx.textAlign = "start"
                ex.graphics.ctx.font = (ex.width()/35).toString()+"px Courier";
                ex.graphics.ctx.fillStyle = "black"
                for (var i = dirOrder.length-1; i >= 0; i--) {
                    ex.graphics.ctx.fillText("floodfill("+dirOrder[i]+")",
                                             2*ex.width()/3, 
                                            (4-i)*ex.height()/6);
                };
            },
            remove: function(){
                for (var i = 0; i < code.dropdowns.length; i++) {
                    code.dropdowns[i].remove();
                };
            }
        }

    var initMode = function(mode){
        ex.stopTimer(onTimer);

        ff.init(Math.floor(Math.random()*model.rows),Math.floor(Math.random()*model.cols));
        ff.reset();
        for (var i = 0; i < objects.length; i++) {
            objects[i].remove();
            };

            objects = [];
            ex.chromeElements.submitButton.off("click");
            ex.graphics.off("mousedown");
            if (mode === "demo") {
                initDemo();
            } else if(mode === "assessment1"){
                initAssessment1();
            } else if(mode === "assessment2"){
                initAssessment2();
            } else if(mode === "selfTest"){
                initSelfTest();
            };

        
        code.init();
        objects.push(code);
        }
    /*
    --------------
    INIT FUNCTIONS
    --------------
    */

        var initPlayButtons = function(){
            var nextButton = ex.createButton(3*ex.width()/8+margin,
                                             4*ex.height()/5, "next",{
                width: "40px",
                height: "20px"
            }).on("click", function(){
                ff.next();
                ex.stopTimer(onTimer);
                playButton.text("play")
            });
            objects.push(nextButton)
                //Play and Pause button
            var playButton = ex.createButton(2*ex.width()/8+margin,
                                             4*ex.height()/5, "play",{
                width: "40px",
                height: "20px"
            })
            playButton.on("click", function(){
                if (playButton.text() == "play") {
                onTimer = ex.onTimer(200,function () { 
                            ff.next();
                        });
                playButton.text("pause");
                } else {
                    ex.stopTimer(onTimer);
                    playButton.text("play")
                };
            });

            objects.push(playButton)

            var stepBackButton = ex.createButton(ex.width()/8+margin,
                                                 4*ex.height()/5, "back",{
                width: "40px",
                height: "20px"
                }).on("click", function(){
                            ex.stopTimer(onTimer);
                            ff.stepBack();
                });
             

            objects.push(stepBackButton)
        }

            /*
            --------------
            INIT DEMO MODE
            --------------
            */
        var initDemo = function(){
            initPlayButtons();

                //Reset Button
            var resetButton = ex.createButton(margin,
                                              4*ex.height()/5, "reset",{
                width: "40px",
                height: "20px"
                }).on("click", function(){
                            ff.reset();
                });

            objects.push(resetButton)

        ex.chromeElements.resetButton.on("click", function(){ff.reset();})
    }

        /*
        --------------
        INIT ASSESSMENT1 MODE
        --------------
        */
    var initAssessment1 = function(){
        
            //Reset Button
        var resetButton = ex.createButton(margin,
                                          4*ex.height()/5, "reset",{
            width: "40px",
            height: "20px"
            }).on("click", function(){
                        ex.stopTimer(onTimer);
                        ff.reset();
            });

        objects.push(resetButton)

        ex.chromeElements.resetButton.on("click", function(){ff.reset();})

        ex.graphics.on("mousedown", function(event){

        var width = (ex.width()/2)/model.cols;
        var height = (5*ex.height()/7)/model.rows;
        var x = event.offsetX - margin;
        var y = event.offsetY - margin;
        var col = Math.floor(x/width);
        var row = Math.floor(y/height);
        if(row >= 0 && row < model.rows && col >= 0 && col < model.cols &&
            model.board[row][col].visited != true){
                //figure out a way to keep track of what is next
                if(ff.nextStack.length>0){
                    var next = ff.nextStack.pop();
                    while(next.row < 0 || next.row >= model.rows ||
                        next.col < 0 || next.col >= model.cols ||
                        model.board[next.row][next.col] == null ||
                        model.board[next.row][next.col].visited == true){
                        next = ff.nextStack.pop();
                    }
                    if (next.row == row && next.col == col) {
                        ff.nextStack.push(next);
                        ff.next();
                        if(checkFull()){
                            ex.showFeedback("Done! Way to go!");
                        }

                    } else {
                        ex.showFeedback("Incorrect! Pay close attention\
                                        to the order of events!")
                        ff.nextStack.push(next);
                    }
                }
        }

    });
    }


        /*
        --------------
        INIT assessment 2 MODE
        --------------
        */
    var initAssessment2 = function(){
        initPlayButtons();
            //Reset Button
        var resetButton = ex.createButton(margin,
                                          4*ex.height()/5, "reset",{
            width: "40px",
            height: "20px"
            }).on("click", function(){
                        ex.stopTimer(onTimer);
                        ff.reset();
            });

        ex.chromeElements.resetButton.on("click", function(){ff.reset();})

        ex.chromeElements.submitButton.on("click", 
            function(){
                var correct = true;
                ex.stopTimer(onTimer);
                for (var i = 0; i < model.dirOrder.length; i++) {
                    if(model.dirOrder[i] !== ex.data.answers[i]){
                        correct = false;
                    }

                }
                if(correct){
                    ex.showFeedback("Correct!!!");
                } else {
                    ex.showFeedback("Incorrect!!! Try tracing the code as the\
                                board fills and seeing when it changes \
                                direction");
                };

            })
    }


    var initSelfTest = function(){
        var questions = ["pickLast", "fillIn"]
        for (var i = 0; i < Math.floor(Math.random()*10)+15; i++) {
            ff.next();
        };
        var question = questions[Math.floor(Math.random()*2)]
        if(question === "fillIn"){
            while(model.board[ff.curRow][ff.curCol] === null || model.board[ff.curRow][ff.curCol].visited){
                ff.curRow = Math.floor(Math.random()*model.rows);
                ff.curCol = Math.floor(Math.random()*model.cols);
            }
        } else if(question === "pickLast"){
            ex.graphics.on("mousedown", function(){

            })
        }
        drawAll();

    }


/*
--------------
MODE BUTTONS
--------------
*/
    var demoButton = ex.createButton(ex.width()/2 + 40 * 7,
                                    margin, "Demo Mode").on("click",
                                    function(){
                                        ex.data.meta.mode = "demo";
                                        initMode("demo");
                                    });

    var assess1Button = ex.createButton(ex.width()/2 + 40,
                                    margin, "Assessment 1").on("click",
                                    function(){
                                        ex.data.meta.mode = "assessment1";
                                        initMode("assessment1");
                                    });

    var assess2Button = ex.createButton(ex.width()/2 + 40 * 4,
                                    margin, "Assessment 2").on("click",
                                    function(){
                                        ex.data.meta.mode = "assessment2";
                                        initMode("assessment2");
                                    });



    var initModel = function() {
        if (typeof ex.data.model !== 'undefined') {
            model = ex.data.model;
            return;
        }
        model.rows = 5;
        model.cols = 5;
        var initBoard = function(rows, cols) {
            var board = [];
            for (var i = 0; i < rows; i++) {
                var row = []
                for (var j = 0; j < cols; j++) {
                    if (Math.random() < 0.1) {
                        row.push(null);
                    } else {
                        row.push({
                            visited: false,
                            depth: 0,
                            direction: null,
                            row: i,
                            col: j   
                        });
                    }
                }
                board.push(row);
            }
            return board;
        };
        model.board = initBoard(model.rows, model.cols);
        model.dirOrder = shuffle([UP, RIGHT, DOWN, LEFT]);
        ex.data.model = model;
    };
    initModel();
    
    /* The floodfill object */
    var ff = {
        nextStack: [],
        prevStack: [],
        initialRow: 0,
        initialCol: 0,
        curRow:     0,
        curCol:     0,
        init: function(row, col) {
            while(model.board[row][col] === null){
                row = (Math.floor(Math.random()*model.rows))
                col = (Math.floor(Math.random()*model.cols))
            }
            ff.nextStack = []
            ff.prevStack = []
            ff.nextStack.push({ row: row, col: col, depth: 0 });
            ff.initialRow = row; //I added these lines too
            ff.initialCol = col;
            ff.curRow = row;
            ff.curCol = col;
            ff.next();
        },
        next: function() {
            if (ff.nextStack.length === 0) {
                ff.curRow = ff.initialRow//I put this there
                ff.curCol = ff.initialCol//I put this there
                return DONE;
            }
            var cur = ff.nextStack.pop();
            var row = cur.row;
            var col = cur.col;
            if (row < 0 || row >= model.cols || col < 0 || col >= model.cols) {
                return OFF_BOARD;
            }
            if (model.board[row][col] === null) {
                //ff.curRow = row; //me again
                //ff.curCol = col; //yep, it's late.
                //drawAll();
                cur.success = false;
                ff.prevStack.push(cur)
                return BLOCKED;
            }
            if (model.board[row][col].visited) {
                //ff.curRow = row; //man, I'm tired
                //ff.curCol = col; //So tired.
                //drawAll();
                cur.success = false;
                ff.prevStack.push(cur)
                return FILLED;
            }
            //I wrote this
            ff.curRow = cur.row;
            ff.curCol = cur.col;
            cur.success = true;
            //Up to here
            var curFrame = model.board[cur.row][cur.col];
            curFrame.direction = cur.direction //I added this
            curFrame.depth = cur.depth //And this
            curFrame.visited = true;
            ff.prevStack.push(cur);
            for (var i = 0; i < model.dirOrder.length; i++) {
                var dir = model.dirOrder[i];
                var next = {};
                switch (dir) {
                    case UP:
                        next.row = row-1;
                        next.col = col;
                        break;
                    case RIGHT:
                        next.row = row;
                        next.col = col+1;
                        break;
                    case DOWN:
                        next.row = row+1;
                        next.col = col;
                        break;
                    case LEFT:
                        next.row = row;
                        next.col = col-1;
                        break;
                }
                next.direction = dir;
                next.depth = cur.depth + 1; //Also this
                ff.nextStack.push(next);
            }
            drawAll();
            return MOVED;
        },
        reset: function(){
            for (var row = 0; row < model.rows; row++) {
                for(var col = 0; col < model.cols; col++){
                    cell = model.board[row][col];
                    if (cell != null) {
                        cell.visited = false;
                        cell.depth = 0;
                    };
                }
            };
            for (var i = 0; i < arrows.length; i++) {
                arrows[i].remove()
            };
                ff.init(ff.initialRow, ff.initialCol);
                drawAll();
        },
        stepBack: function(){
            if (ff.prevStack.length === 0){
                return DONE;
            }
            var last = ff.prevStack.pop();
            if (last.success){
                for (var i = 0; i < 4; i++) {
                    ff.nextStack.pop();  
                };
                model.board[last.row][last.col].visited = false;
                ff.curCol = last.col
                ff.curRow = last.rows
                ff.nextStack.push(last);
            }
            drawAll();
        }
    };

    //Draws the arrows
    var drawArrow = function(dir, startx, starty, width, height){
                var img = "star.png";
                var endx = startx;
                var endy = starty;
        switch(dir){
            case UP:
                endx = startx + width/4;
                endy = starty+ 3*height/4;
                img = "up.png";
                break;
            case DOWN:
                endx = startx + width/4;
                endy = starty - height/4;
                img = "down.png";
                break;
            case LEFT:
                endx = startx + 3*width/4;
                endy = starty + height/4;
                img = "left.png";
                break;
            case RIGHT:
                endx = startx - width/4;
                endy = starty + height/4;
                img = "right.png";
                break;
            default:
                endx = startx + width/4
                endy = starty + height/4
                break;
            }
            arrows.push(ex.createImage(endx,endy,img,{
                width: (width/2).toString()+"px",
                height: (height/2).toString()+"px"
            }));

        }

    window.printBoard = function() {
        for (var i = 0; i < model.rows; i++) {
            for (var j = 0; j < model.cols; j++) {
                if (model.board[i][j] !== null) {
                    console.log(model.board[i][j].visited);
                }
            }
        }
    }

    //Draw the grid
    var drawGrid = function(){
        var width = (ex.width()/2)/model.cols;
        var height = (5*ex.height()/7)/model.rows;
        for (var row = 0; row < model.rows; row++) {
            for (var col = 0; col < model.cols; col++) {
                var cell = model.board[row][col];
                var xpos = col*width
                var ypos = row*height
                if (row == ff.curRow && col == ff.curCol) {
                    ex.graphics.ctx.strokeStyle = "rgb(0,255,0)"
                    ex.graphics.ctx.lineWidth = 5;
                } else {
                    ex.graphics.ctx.strokeStyle = "black"
                    ex.graphics.ctx.lineWidth = 1
                };
                if (cell == null) {
                    ex.graphics.ctx.fillStyle = "black";
                    ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height);
                } else {
                    ex.graphics.ctx.font = (ex.width()/35).toString()+"px Courier"
                    ex.graphics.ctx.fillStyle = "rgb("+
                        (250*cell.depth/(model.rows*model.cols/2)).toString()
                        +",0,"+
                        (255-250*cell.depth/(model.rows*model.cols)).toString()
                        +")";
                                        if (cell.visited) {
                        ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height); 
                        drawArrow(cell.direction, xpos+margin, 
                                ypos+margin, width, height)
                        ex.graphics.ctx.strokeRect(xpos + margin,
                                                    ypos + margin,
                                                    width,
                                                    height);
                        ex.graphics.ctx.fillStyle = "black";
                        ex.graphics.ctx.textAlign = "end"
                        ex.graphics.ctx.fillText(
                            model.board[row][col].depth.toString(),
                            xpos + margin + width,
                            ypos + 2*margin)
                    } else {
                        ex.graphics.ctx.strokeRect(xpos + margin,
                                                ypos + margin,
                                                width,
                                                height);
                    };
                };
            };
        };
    };

    //Check if the board is fully visited
    var checkFull = function(){
        for (var row = 0; row < model.rows; row++) {
            for(var col = 0; col < model.cols; col++){

                if(model.board[row][col] != null){
                    if(model.board[row][col].visited == false){return false};
                }
            }
        };
        return true;
    }

    //End of buttons

    var makeSelection = function(i, answer){
        return function(){
            ex.data.answers[i] = answer;
        }
    }




    var drawAll = function(){
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        for (var i = 0; i < arrows.length; i++) {
            arrows[i].remove()
        };
        drawGrid();
        code.draw();
    }


    


    

    code.init();
    initMode(ex.data.meta.mode);
    drawAll();
    



};

