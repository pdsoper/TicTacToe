$(document).ready(function() {
    
	var boardActive = false;
	var moveCount = 1;
	var firstMove = "human";
	var thisMove = "human";
	var humanXO = "X";
	var computerXO = "O";
	var board = {
		c11: "", c12: "", c13: "",
		c21: "", c22: "", c23: "",
		c31: "", c32: "", c33: "",
	}
	var winners = [
		["c11","c12","c13"],
		["c21","c22","c23"],
		["c31","c32","c33"],
		["c11","c21","c31"],
		["c12","c22","c32"],
		["c13","c23","c33"],
		["c11","c22","c33"],
		["c13","c22","c31"]
	];
	var winnerTransforms = [
		[["c11","c12","c13"], { width: 640, X:    0, Y: -530, rotate:   0, } ],
		[["c21","c22","c23"], { width: 640, X:    0, Y: -325, rotate:   0, } ],
		[["c31","c32","c33"], { width: 640, X:    0, Y: -120, rotate:   0, } ],
		[["c11","c21","c31"], { width: 640, X: -200, Y: -320, rotate:  90, } ],
		[["c12","c22","c32"], { width: 640, X:    0, Y: -320, rotate:  90, } ],
		[["c13","c23","c33"], { width: 640, X:  200, Y: -320, rotate:  90, } ],
		[["c11","c22","c33"], { width: 640, X:    0, Y: -322, rotate:  45, } ],
		[["c13","c22","c31"], { width: 640, X:    0, Y: -322, rotate: -45, } ]
	];
	var thirdMoveForcing = {
		c12: ["c31", "c33"],
		c21: ["c13", "c33"],
		c23: ["c11", "c31"],
		c32: ["c11", "c13"]
	};
	var corners = ["c11", "c13", "c31", "c33"];
	var sides = ["c12", "c21", "c23", "c32"];

	transitionInitialIn();
	// testLines(3000);

	/* Initialization and completion */

	function initialize() {
		moveCount = 1;
		thisMove = firstMove;
		clearBoard();
		drawBoard();
		boardActive = true;
	}

	function gameOver() {
		if (winner()) {
	     	var lineCells = winningCells();
   		 	var tf = getTransform(lineCells);
   	 		applyTransform(tf);
   	 		// flash($('#win-line'), 3);
   	 		alert("Game over - " + thisMove + " wins!"); 
   	 		tf = getTransform();
   	 		applyTransform(tf);
   	 	} else {
			alert("Game over - tie");
   	 	}
   	 	initialize();
   	 	if (thisMove === "computer") {
   	 		makeMove();
   	 	}
	}

	/* Game logic */

	function winner() {
		// Return true if the board contains a winning combibation
		for (var i = 0; i < winners.length; i++) {
			if (board[winners[i][0]] === "") {
				continue;
			}
			if (board[winners[i][0]] === board[winners[i][1]]
			 && board[winners[i][0]] === board[winners[i][2]]) {
			 	return true;
			}
		};
		return false;
	}

	function winningCells() {
		// Return the winning combination of cells, if any
		for (var i = 0; i < winners.length; i++) {
			if (board[winners[i][0]] === "") {
				continue;
			}
			if (board[winners[i][0]] === board[winners[i][1]]
			 && board[winners[i][0]] === board[winners[i][2]]) {
			 	return winners[i];
			}
		};
		return [];
	}

	function winningMoves(ox) {
		// Return a list of all winning moves for the mark ox (X or O)
		var open = allOpenCells();
		var wins = [];
		for (var i = 0; i < open.length; i++) {
			board[open[i]] = ox;
			if (winner()) {
				wins.push(open[i]);
			}
			board[open[i]] = "";
		};
		return wins;
	}

	function blockOpposingCorners(ox) {
		// If the opponent occuies opposing corners, take a side cell
		if ((board.c11 === ox && board.c33 === ox)
	     || (board.c13 === ox && board.c31 === ox)) {
			return randomOpenCell(sides);
		}
		return "";
	}

	function blockAdjacentSides(ox) {
		// If the opponent occupies two adjacent side cells, take the corner cell between them.
		if (board.c12 === ox && board.c21 === ox) {
			return "c11";
		}
		if (board.c12 === ox && board.c23 === ox) {
			return "c13";
		}
		if (board.c21 === ox && board.c32 === ox) {
			return "c31";
		}
		if (board.c23 === ox && board.c32 === ox) {
			return "c33";
		}
		return "";
	}

	function blockCornerAndOppposingSide(ox) {
		// If the opponent occupies a corner and opposite side, take the included corner 
		if (board.c11 === ox) {
			if (board.c23 === ox) {
				return "c13"
			}
			if (board.c32 === ox) {
				return "c31";
			}
		}
		if (board.c13 === ox) {
			if (board.c21 === ox) {
				return "c11";
			}
			if (board.c32 === ox) {
				return "c33";
			}
		} 
		if (board.c31 === ox) {
			if (board.c12 === ox) {
				return "c11";
			}
			if (board.c23 === ox) {
				return "c33";
			}
		}
		if (board.c33 === ox) {
			if (board.c12 === ox) {
				return "c13"
			}
			if (board.c21 === ox) {
				return "c31";
			}
		}
		return "";
	}

	function onSide(ox) {
		// If mark ox (X or O) occupies a side cell, return that cell
		for (var i = 0; i < sides.length; i++) {
			if (board[sides[i]] === ox) {
				return sides[i];
			}
		};
		return "";
	}

	function allOpenCells() {
		var empty = [];
		var arr = Object.keys(board);
		for (var i = 0; i < arr.length; i++) {
			if (board[arr[i]] === "") {
				empty.push(arr[i]);
			}
		};
		return empty;
	}

	function randomOpenCell(arr) {
		if (arr === undefined) {
			arr = Object.keys(board);
		}
		var empty = [];
		for (var i = 0; i < arr.length; i++) {
			if (board[arr[i]] === "") {
				empty.push(arr[i]);
			}
		};
		return randomPick(empty);
	}

	function makeMove() {
		var cid = "";
		// Take the center cell, if available
		if (board.c22 === "") {
			markCell("c22");
			return;
		}
		// If the human takes the center cell, take any corner
		if (moveCount === 2) {
			cid = randomOpenCell(corners);
			markCell(cid);
			return;
		}
		/* If the human takes a side cell on move 2, force a win by taking a 
		corner cell on the opposite side on move 3.  If the human takes a 
		corner cell, a win cannot be forced */
		if (moveCount === 3) {
			var opCell = onSide(humanXO);
			if (opCell.length > 0) {
				cid = randomOpenCell(thirdMoveForcing[opCell]);
			} else {
				cid = randomOpenCell();
			}
			markCell(cid);
			return;
		}
		/* Check for wins. Take it if the computer wins, block it if the
		human would win. */
		var wins = winningMoves(computerXO);
		if (wins.length > 0) {
			markCell(randomOpenCell(wins));
			return;
		}
		wins = winningMoves(humanXO);
		if (wins.length > 0) {
			markCell(randomOpenCell(wins));
			return;
		}
		/* Moves 4 and 5 can give the game away in some cases */
		if (moveCount === 4 || moveCount === 5) {
			cid = blockOpposingCorners(humanXO);
			if (cid.length > 0) {
				markCell(cid);
				return;
			}
			cid = blockAdjacentSides(humanXO);
			if (cid.length > 0) {
				markCell(cid);
				return
			}
			cid = blockCornerAndOppposingSide(humanXO);
			if (cid.length > 0) {
				markCell(cid);
				return;
			}
		}
		/* At this point any open cell will do */
		markCell(randomOpenCell());
		return;
	}

	/* Model and View modifiers */

	function markCell(cell) {
		var mark = '';
		if (thisMove === "human") {
			mark = humanXO;
		} else {
			mark = computerXO;
		}
		board[cell] = mark;
		drawBoard();
		if (winner()) {
			gameOver();
			return;
		}
		moveCount++;
		if (thisMove === "human") {
			thisMove = "computer";
		} else {
			thisMove = "human";
		}
		if (moveCount === 9) {
			makeMove();
			gameOver();
			return;
		}
		if (thisMove === "computer") {
			makeMove();
		} 
	}

	function clearBoard() {
		for (key in board) {
			board[key] = "";
		}
	}

	function drawBoard() {
		for (key in board) {
			var keyId = '#' + key;
			$(keyId).html("");
			$(keyId).html(board[key]);
		}
	}
	
	function transitionInitialIn() {
		$('.initial').animate({
			top: "+=600",
		}, 1000);
	}

	function transitionInitialOut() {
		$('.initial').animate({
			top: "-=600",
		}, 1000);
	}

	function getTransform(cells) {
		if (cells !== undefined) {
			for (var i = 0; i < winnerTransforms.length; i++) {
				if (arrayEqual(cells, winnerTransforms[i][0])) {
					return winnerTransforms[i][1];
				}
			};
		}
		return { width: 0, X: 0, Y: 0, rotate: 0, };
	}

	function applyTransform(tf) {
		if (tf === undefined) {
			tf = { width: 0, X: 0, Y: 0, rotate: 0, };
		}
		$( '#win-line' ).css("width", tf.width + 'px');
		$( '#win-line' ).css("-webkit-transform", 
			    "translateX(" + tf.X + "px) " +		
			    "translateY(" + tf.Y + "px) " +
			    "rotate(" + tf.rotate + "deg)");
	}

	/* Event handling */

	$('td').click(function(event) {
		if (!boardActive || (thisMove === "computer")) {
			return;
		}
		var cid = $(this).attr('id');
		if (board[cid] !== "") {
			return;
		} 		
		markCell(cid);
	})

	$('.btn-human').click(function(event) {
		firstMove = 'human';
		thisMove = "human";
		$('.btn-human').css({
			"background-color": "#000080",
			"color": "white"
		});
		$('.btn-computer').css({
			"background-color": "white",
			"color": "#000080"
		});
	})

	$('.btn-computer').click(function(event) {
		firstMove = 'computer';
		thisMove = 'computer';
		$('.btn-computer').css({
			"background-color": "#000080",
			"color": "white"
		});
		$('.btn-human').css({
			"background-color": "white",
			"color": "#000080"
		});
	})

	$('.btn-x').click(function(event) {
		humanXO = 'X';
		computerXO = 'O';
		$('.btn-x').css({
			"background-color": "#000080",
			"color": "white"
		});
		$('.btn-o').css({
			"background-color": "white",
			"color": "#000080"
		});
	})
 	
	$('.btn-o').click(function(event) {
		humanXO = 'O';
		computerXO = 'X';
		$('.btn-o').css({
			"background-color": "#000080",
			"color": "white"
		});
		$('.btn-x').css({
			"background-color": "white",
			"color": "#000080"
		});
	})
 	
	$('.start-game').click(function(event) {
		transitionInitialOut();
		boardActive = true;
		if (firstMove === "computer") {
			makeMove();
		}
	});

	/* Utility functions */

	function randomPick(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function flash($element, times) {
		$element.fadeIn( 100 );
	    for(var i = 0; i <= times; i ++) {
	      $element
	        .fadeOut( 100 )
	        .delay( 200 )
	        .fadeIn( 100 );
    	}
    	$element.fadeOut( 100 );
  	}

	function testLines() {
		/* The nested functions are required in order to keep i in scope. */
		for (var i = 0; i < winnerTransforms.length; i++) {
			setTimeout(function(x) { 
				return function() {
					console.log(x);
					applyTransform(winnerTransforms[x][1]); 
					flash($('#win-line'), 3);
				}; 
			}(i), 3000 * i); 
		};
	}

	function deepEqual(arr1, arr2) {
		if (arr1 === null && arr2 === null) {
			return true;
		}
		if (arr1 === null || arr2 === null) {
			return false;
		}
		if (typeof arr1 !== typeof arr2) {
			return false;
		}
		if (typeof arr1 === "object") {
			if (Array.isArray(arr1)) {
				if (Array.isArray(arr2)) {
					return arrayEqual(arr1, arr2);	
				} else {
					return false;
				}
			} else {
				return objectEqual(arr1, arr2);
			}
		} else {
			return arr1 === arr2;
		}
	}

	function arrayEqual(arr1, arr2) {
		if (arr1.length !== arr2.length) {
			return false;
		}
		if (arr1.length === 0) {
			return true;
		}
		return deepEqual(arr1[0], arr2[0]) 
			&& arrayEqual(arr1.slice(1), arr2.slice(1));				
	}

	function objectEqual(obj1, obj2) {
		if (obj1 === null && obj2 === null) {
			return true;
		}
		if (obj1 === null || obj2 === null) {
			return false;
		}
		var k1 = Object.keys(obj1);
		var k2 = Object.keys(obj2);
		if (k1.length !== k2.length) {
			return false;
		}
		for (var i = 0; i < k1.length; i++) {
			if (k2.indexOf(k1[i]) === -1 ) {
				return false;
			}
			if (!deepEqual(obj1[k1[i]], obj2[k1[i]])) {
				return false;
			}
		};
		return true;
	}

}); 
