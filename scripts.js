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
		[["c11","c22","c33"], { width: 900, X:    0, Y: -322, rotate:  45, } ],
		[["c13","c22","c31"], { width: 900, X:    0, Y: -322, rotate: -45, } ]
	];
	var thirdMoveForcing = {
		c12: ["c31", "c33"],
		c21: ["c13", "c33"],
		c23: ["c11", "c31"],
		c32: ["c11", "c13"]
	};
	var corners = ["c11", "c13", "c31", "c33"];
	var sides = ["c12", "c21", "c23", "c32"];


	// transitionInitialIn();
	applyTransform();
//	applyTransform(winnerTransforms[0][1]);
//	applyTransform(winnerTransforms[1][1]);
//	applyTransform(winnerTransforms[2][1]);
//	applyTransform(winnerTransforms[3][1]);
//	applyTransform(winnerTransforms[4][1]);
//	applyTransform(winnerTransforms[5][1]);
//	applyTransform(winnerTransforms[6][1]);
	applyTransform(winnerTransforms[7][1]);

	function testLines() {
		for (var i = 0; i < winnerTransforms.length; i++) {
			setTimeout(applyTransform(winnerTransforms[i][1]), 5000);
		};
	}

    
	/* Initialization and completion */

	function initialize() {
		boardActive = false;
		moveCount = 1;
		thisMove = firstMove;
		clearBoard();
	}

	function clearBoard() {
		for (key in board) {
			board[key] = "";
		}
		drawBoard();
	}

	function gameOver() {
		alert("Game over");
		if (winner()) {
	     	var lineCells = winningCells();
   		 	var tf = getTransform(lineCells);
   	 		applyTransform(tf);
   	 		// flashLine();
   	 		tf = getTransform();
   	 		applyTransform(tf);
   	 	}
		setTimeout(initialize(), 5000);
		transitionInitialIn();
	}

	function getTransform(cells) {
		if (cells !== undefined) {
			for (var i = 0; i < winnerTransforms.length; i++) {
				if (cells == winnerTransforms[i][0]) {
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
		console.log(tf);
		$( '#win-line' ).css("width", tf.width + 'px');
		$( '#win-line' ).css("-webkit-transform", 
			    "translateX(" + tf.X + "px) " +		
			    "translateY(" + tf.Y + "px) " +
			    "rotate(" + tf.rotate + "deg)");
	}

	/* Game logic */

	function winner() {
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

	function winningMoves(ox) {
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
		if ((board.c11 === ox && board.c33 === ox)
	     || (board.c13 === ox && board.c31 === ox)) {
			return randomOpenCell(sides);
		}
		return "";
	}

	function blockAdjacentSides(ox) {
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
		// If the human takes the center cell, take a corner
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
			cid = blockOpposingCorners();
			if (cid.length > 0) {
				markCell(cid);
				return;
			}
			cid = blockAdjacentSides();
			if (cid.length > 0) {
				markCell(cid);
				return
			}
			cid = blockCornerAndOppposingSide();
			if (cid.length > 0) {
				markCell(cid);
				return;
			}
		}
		/* At this point any open cell will do */
		markCell(randomOpenCell());
		return;
	}

	/* View modifiers */

	function markCell(cell) {
		var mark = '';
		if (thisMove === "human") {
			mark = humanXO;
		} else {
			mark = computerXO;
		}
		board[cell] = mark;
		drawBoard();
		console.log("Marking cell", cell, " with ", mark, " on move ", moveCount);
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

	/* Uility functions */

	function randomPick(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}


	function flash($element, times) {
	    for(var i = 0; i <= times; i ++) {
	      $element
	        .fadeOut( 100 )
	        .delay( 200 )
	        .fadeIn( 100 );
    	}
  	}



}); 
