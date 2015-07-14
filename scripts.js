$(document).ready(function() {
    
    var boardActive = false;
	var moveCount = 1;
	var firstMove = "human";
	var thisMove = "human";
	var humanXO = "X";
	var computerXO = "O";
	var board = {
		c11: "",
		c12: "",
		c13: "",
		c21: "",
		c22: "",
		c23: "",
		c31: "",
		c32: "",
		c33: "",
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
	var thirdMoveForcing = {
		c12: ["c31", "c33"],
		c21: ["c13", "c33"],
		c23: ["c11", "c31"],
		c32: ["c11", "c13"]
	};
	var corners = ["c11", "c13", "c31", "c33"];
	var sides = ["c12", "c21", "c23", "c32"];

	transitionInitialIn();

	function gameOver() {
		alert("Game over");
		setTimeout(initialize(), 5000);
		transitionInitialIn();
	}

	function initialize() {
		boardActive = false;
		moveCount = 1;
		thisMove = firstMove;
		clearBoard();
	}

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
		/* Move 4 has a number of special cases */
		if (moveCount === 4) {
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
			cid = randomOpenCell();
			markCell(cid);
			return;
		}
		/* At this point any cell will do */
		markCell(randomOpenCell());
		return;
	}

	function randomPick(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

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

	function clearBoard() {
		for (key in board) {
			board[key] = "";
		}
		drawBoard();
	}

	function drawBoard() {
		for (key in board) {
			var keyId = '#' + key;
			$(keyId).html("");
			$(keyId).html(board[key]);
		}
	}

}); 
