// draw 
// controls 

var game_no = 0;

var game_matrix = [[-1,-1,-1,-1,-1,-1,-1], 
                   [-1,-1,-1,-1,-1,-1,-1],
                   [-1,-1,-1,-1,-1,-1,-1],
                   [-1,-1,-1,-1,-1,-1,-1],
                   [-1,-1,-1,-1,-1,-1,-1],
                   [-1,-1,-1,-1,-1,-1,-1]];

var gameOver = false;
var winningPoints = [];
var started = false;

var game_container = document.getElementById("app");
var column_stack = [5,5,5,5,5,5,5]; // Each number shows the top index (0-index) of each column which is available

var players = ["#ff6666", "#1b7fdd"];
var player = 0;

// Global Variables for keyboard Navigation
var focus_col_no = 3;
var focused = false;
var mouse_on_board = false;


function init() {
    for (let i = 0; i < 7; i++) {
        let col = document.createElement("div");
        col.classList.add(`col-${i+1}`);

        for (let j = 0; j < 6; j++) {
            let block = document.createElement("div");
            block.classList.add(`block`);

            col.appendChild(block);
        }

        column_events(col);

        game_container.append(col);
    }

    document.querySelector(".start-btn").onclick = () => {
        start();
    }
}

function highlight(col, col_id, blocks) {
    const top = column_stack[col_id-1];

    if (top >= 0) {
        blocks[top].classList.add(`highlight-player-${player}`);
        col.classList.add("highlight");
    }
}

function unHighlight(col, col_id, blocks) {
    const top = column_stack[col_id-1];

    if (top >= 0) {
        blocks[top].classList.remove(`highlight-player-${player}`);
        col.classList.remove("highlight");
    }
}

function column_events(col) {

    const col_name = col.classList[0];
    const col_id = Number(col_name[4]);
    let blocks = col.children;

    // Hovering Events
    // When mouse is over a column
    col.addEventListener("mouseover", (e) => {
        highlight(col, col_id, blocks);
    })

    // When mouse leaves a column
    col.addEventListener("mouseleave", (e) => {
        unHighlight(col, col_id, blocks);
    })

    // Click Event (Move)
    col.addEventListener("click", (e) => {
        gameSpecifics(col,col_id,blocks);
    });
}

function gameSpecifics(col,col_id,blocks) {
    col.classList.remove("highlight");
    const top = column_stack[col_id-1];
    
    if (top >= 0) {   
        
        // Make the move 
        blocks[top].style.backgroundColor = players[player];
        column_stack[col_id-1]--;

        // Update Game Matrix
        const row_no = top;
        const col_no = col_id-1;

        game_matrix[row_no][col_no] = player;
        
        // Check if someone has won
        const point = [row_no,col_no];
        check(point);

        if(gameOver) {
            // Ending/restarting Procedures
            endGame();
            return;
        }

        // Toggle Players
        togglePlayers();

        focused = false;
    }
}

function togglePlayers() {
    player = (player == 0 ? 1: 0);

    document.querySelector(`.alert-player-1`).classList.toggle("show");
    document.querySelector(`.alert-player-2`).classList.toggle("show");
}

function check(point) {
    const axes = findAxes(point); 

    axes.forEach( axis => {
        if(axis.length >= 4) {
            for (let i = 0; i < axis.length-3; i += 1) {
                if (axis[i][1] != -1) {

                    if ([axis[i][1], axis[i+1][1], axis[i+2][1], axis[i+3][1]].every( (val, i, arr) => val === arr[0] )) {
                        
                        gameOver = true;
                        winningPoints = [axis[i][0], axis[i+1][0], axis[i+2][0], axis[i+3][0]];
                        return;
                    } 
                }
            }
        }
    });

    return;
}

function findAxes(point) {
    // We will check 4 axes which intersect on the point which has been occupied by the player's move
    let horizontalAxis =  [];
    let verticalAxis = [];
    let primaryDiagonal = [];
    let secondaryDiagonal = [];

    // Horizontal
    for(let c = 0; c < 7; c++) {
        const r = point[0];
        horizontalAxis.push([[r,c],game_matrix[r][c]]);
    }

    // Vertical
    for(let r = 0; r < 6; r++) {
        const c = point[1];
        verticalAxis.push([[r,c],game_matrix[r][c]]);
    }  

    // Primary Diagonal
    // Manhattan Distances 
    let pmd1 = Math.min(point[0], point[1]); 
    let pmd2 = Math.min(5 - point[0], 6 - point[1]);

    // Endpoints 
    let pde1 = [point[0] - pmd1, point[1] - pmd1];
    let pde2 = [point[0] + pmd2, point[1] + pmd2];

    for(let r = pde1[0], c = pde1[1]; r <= pde2[0] && c <= pde2[1]; r++,c++) {
        primaryDiagonal.push([[r,c],game_matrix[r][c]]);
    }

    // Secondary Diagonal
    // Manhattan Distances
    let smd1 = Math.min(5 - point[0], point[1]);
    let smd2 = Math.min(point[0], 6 - point[1]);

    // Endpoints
    // (+,-)
    let sde1 = [point[0] + smd1, point[1] - smd1];
    // (-,+)
    let sde2 = [point[0] - smd2, point[1] + smd2];
    
    for(let r = sde1[0], c = sde1[1]; r >= sde2[0] && c <= sde2[1]; r--, c++) {
        secondaryDiagonal.push([[r,c],game_matrix[r][c]]);
    }

    return [horizontalAxis, verticalAxis, primaryDiagonal, secondaryDiagonal];
}

function endGame() {
    let matrix = [] // Html specific reference

    // Show the winning move
    document.querySelectorAll(`div[class*="col"]`).forEach(col => {
        blocks = col.querySelectorAll(".block");
        matrix.push(blocks);
    });

    winningPoints.forEach(point => {
        point_html = matrix[point[1]][point[0]];
        
        point_html.style.border = "5px solid #3f4245";
    });

    document.querySelector(`.alert-player-${player+1}`).innerText = "You Won!!!";
    
    // Remove Event Listeners (Can't do that :<, but ... here is something)
    // Create an overlay spaning the whole game board, which will seat over the board to turn off the board mouse events
    let overlay = document.querySelector(".gg");
    overlay.style.display = "block";

    // Show the ending screen
    let endingScreen = document.querySelector(".ending-screen");
    endingScreen.innerHTML = `<header>Player ${player+1} <br> Wins </header>`

    endingScreen.style.display = "block";
    endingScreen.classList.add("show"); 

    window.removeEventListener("keydown", keyboardMoves);

    // Show the speech bubble 
    let speechBubble = document.querySelector(".opening-speech-bubble");
    speechBubble.innerText = "Click to Play Again"
    speechBubble.style.opacity = "1";
}

function keyboardNav() {
    window.addEventListener("keydown", keyboardMoves);

    // Set an event handler so that when the mouse is hovered over the board, the keyboard based highlighting would stop
    game_container.addEventListener("mouseover", () => {
        if(mouse_on_board == false) {
            game_container.querySelectorAll(`[class*="col"]`).forEach(col => {
                if(col.classList.contains("highlight")) {
                    unHighlight(col, Number(col.classList[0][4]), col.children);
                }
            });
        }

        mouse_on_board = true;
    });

    game_container.addEventListener("mouseleave", () => {
        focus_col_no = 3;
        focused = false;
        mouse_on_board = false;
    });
}

function keyboardMoves(e) {
    if(!mouse_on_board) {
        if(e.key == "ArrowLeft" || e.key == "a" || e.key == "A") {
            if ((e.key == "ArrowLeft" && player == 1) || ((e.key == "a" || e.key == "A") && player == 0)) {
                if (focus_col_no > 0) {

                    if (focused) {
                        let col = document.querySelector(`.col-${focus_col_no+1}`);
                        const col_name = col.classList[0];
                        const col_id = Number(col_name[4]);
                        let blocks = col.children;
                        
                        unHighlight(col, col_id, blocks);
                        focus_col_no -= 1;
                    }

                    let col = document.querySelector(`.col-${focus_col_no+1}`);
                    const col_name = col.classList[0];
                    const col_id = Number(col_name[4]);
                    let blocks = col.children;
                    
                    highlight(col, col_id, blocks);
                    focused = true;
                }
            }   
        }
        if(e.key == "ArrowRight" || e.key == "d" || e.key == "D") {
            if ((e.key == "ArrowRight" && player == 1) || ((e.key == "d" || e.key == "D") && player == 0)) {
                if(focus_col_no < 6) {

                    if (focused) {
                        let col = document.querySelector(`.col-${focus_col_no+1}`);
                        const col_name = col.classList[0];
                        const col_id = Number(col_name[4]);
                        let blocks = col.children;
                        
                        unHighlight(col, col_id, blocks);
                        focus_col_no += 1;
                    }

                    let col = document.querySelector(`.col-${focus_col_no+1}`);
                    const col_name = col.classList[0];
                    const col_id = Number(col_name[4]);
                    let blocks = col.children;
                    
                    highlight(col, col_id, blocks);
                    focused = true;
                }
            }
        }
        if(e.key == "Enter") {
            if(focused) {
                let col = document.querySelector(`.col-${focus_col_no+1}`);
                const col_name = col.classList[0];
                const col_id = Number(col_name[4]);
                let blocks = col.children;  
                
                gameSpecifics(col,col_id,blocks);
            }
        }
    }
}

function start() {
    if(document.querySelector(".gg").style.display == "block") {
        keyboardNav();
        // Remove the speech bubble
        let speechBubble = document.querySelector(".opening-speech-bubble");
        speechBubble.style.opacity = "0";

        // Remove the Ending Screen (if applicable)
        let endingScreen = document.querySelector(".ending-screen");
        
        if (endingScreen.classList.contains("show")) {
            endingScreen.classList.remove("show");
            endingScreen.style.display = "none";
        }
        
        // Show the Play Screen
        let startScreen = document.querySelector(".start-overlay");
        startScreen.style.display = "block";
        startScreen.classList.add("show");

        setTimeout(() => {
            startScreen.classList.remove("show");
            
            // Remove the overlay after the animation
            setTimeout(() => {
                document.querySelector(".gg").style.display = "none";
                startScreen.style.display = "none";
            }, 500);
        }, 500);

        // Reset Game Variables
        game_matrix = [[-1,-1,-1,-1,-1,-1,-1], 
                       [-1,-1,-1,-1,-1,-1,-1],
                       [-1,-1,-1,-1,-1,-1,-1],
                       [-1,-1,-1,-1,-1,-1,-1],
                       [-1,-1,-1,-1,-1,-1,-1],
                       [-1,-1,-1,-1,-1,-1,-1]];

        gameOver = false;
        winningPoints = [];

        column_stack = [5,5,5,5,5,5,5];

        // Global Variables for keyboard Navigation
        focus_col_no = 3;
        focused = false;
        mouse_on_board = false;

        // Reset Html elements
        document.querySelectorAll(`div[class*="col"]`).forEach(col => {
            document.querySelectorAll(".block").forEach(block => {
                block.classList.remove("highlight-player-1");
                block.classList.remove("highlight-player-0");

                block.style.backgroundColor = "white";
                block.style.borderColor = "#00000000";
            });
        });

        

        // Show whose move is it
        // Remove the winning message 
        document.querySelector(`.alert-player-${player+1}`).classList.remove("show");
        setTimeout(() => {
            document.querySelector(`.alert-player-1`).innerHTML = "Your Move.";
            document.querySelector(`.alert-player-2`).innerHTML = "Your Move.";
        }, 500);

        // Select a random player for first move
        player = (player == 0 ? 1: 0);
        document.querySelector(`.alert-player-${player+1}`).classList.add("show");
    }
}

$(document).ready(() => {
    init();
});
