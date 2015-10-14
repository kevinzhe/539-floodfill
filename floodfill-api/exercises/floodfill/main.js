var main = function(ex) {
    window.exdata = ex.data;
    window.ex = ex
    var model = {};
    var initModel = function() {
        if (typeof ex.data.model != 'undefined') {
            model = ex.data.model;
        } else {
            /* Initialize our model fields */
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
                                depth: null,
                                direction: null
                            });
                        }
                    }
                    board.push(row);
                }
                return board;
            };
            model.board = initBoard(model.rows, model.cols);
            ex.data.model = model;
        }
    };
    initModel();

    var drawArrow = function(start, end){
        ex.graphics.ctx.fillStyle = "black";
        ex.graphics.ctx.moveTo(start);
        ex.graphics.ctx.lineTo(end);
        ex.graphics.ctx.stroke();

    }

    var drawGrid = function(){
        var width = ex.width()/2;
        var height = ex.height()/2;
        var margin = 20
        for (var row = 0; row < model.rows; row++) {
            for (var col = 0; col < model.cols; col++) {
                if (model.board[row][col] == null) {
                    ex.graphics.fillStyle = "black";
                    ex.graphics.ctx.fillRect(col*width/model.cols + margin,
                                               row*height/model.rows + margin,
                                                width/model.cols,
                                                height/model.rows);  
                } else {
                    ex.graphics.fillStyle = "green";
                    if (model.board[row][col].visited) {
                        ex.graphics.ctx.fillRect(col*width/model.cols + margin,
                                                row*height/model.rows + margin,
                                                width/model.cols,
                                                height/model.rows); 

                    } else {
                    ex.graphics.ctx.strokeRect(col*width/model.cols + margin,
                                               row*height/model.rows + margin,
                                                width/model.cols,
                                                height/model.rows);
                    };
                };

            };
        };
    };
    drawGrid();
};

